import * as http from 'http'
import * as https from 'https'
import { parse } from 'url'
import { spawn } from 'child_process'
import { HttpClient } from '@actions/http-client'
import * as core from '@actions/core'
import { BearerCredentialHandler } from '@actions/http-client/lib/auth'

console.log("hello, world!");
var errorBuffer = []
function debug(message: string) {
    errorBuffer.push(message)
}

if (!process.env.IS_BACKGROUND) {
    console.log('spawning');
    debug('foreground')
    const child = spawn(process.execPath, process.argv.slice(1), {
        detached: true,
        stdio: 'inherit',
        env: {...process.env, IS_BACKGROUND: '1'}
    });
    child.unref();
} else {
    main();
}

interface ArtifactCacheEntry {
    cacheKey?: string
    scope?: string
    creationTime?: string
    archiveLocation?: string
}

interface CommitCacheRequest {
    size: number
}

interface ReserveCacheRequest {
    key: string
    version?: string
    cacheSize?: number
}

interface ReserveCacheResponse {
    cacheId: number
}

function isSuccessfulStatusCode(statusCode?: number): boolean {
    if (!statusCode) {
        return false
    }
    return 200 <= statusCode && statusCode < 300
}

async function putCache(httpClient: HttpClient, baseUrl: string, type: string, hash: string, size: number, stream: NodeJS.ReadableStream): Promise<boolean> {
    const key = `${type}-${hash}`
    const version = 'b'
    const reserveCacheRequest: ReserveCacheRequest = {
        key: key,
        version: version,
        cacheSize: size
    }
    const r = await httpClient.postJson<ReserveCacheResponse>(`${baseUrl}caches`, reserveCacheRequest)
    const cacheId = r?.result?.cacheId
    if (!cacheId) {
        debug(`ReserveCache failed: ${r.statusCode}`)
        stream.resume()
        return false;
    }
    const upload = await httpClient.sendStream('PATCH', `${baseUrl}caches/${cacheId}`, stream, {
        'Content-Type': 'application/octet-stream',
        'Content-Range': `bytes 0-${size-1}/*`
    })
    if (!isSuccessfulStatusCode(upload.message.statusCode)) {
        debug(`Upload failed: ${upload.message.statusMessage}`)
        stream.resume()
        return false
    }
    const commitCacheRequest: CommitCacheRequest = { size: size }
    const commit = await httpClient.postJson<null>(`${baseUrl}caches/${cacheId}`, commitCacheRequest)
    if (!isSuccessfulStatusCode(commit.statusCode)) {
        core.debug(`Commit failed: ${commit.statusCode}`)
        return false
    }
    return true
}

async function getCache(httpClient: HttpClient, baseUrl: string, type: string, hash: string): Promise<NodeJS.ReadableStream | null> {
    const key = `${type}-${hash}`
    const version = 'b'

    const r = await httpClient.getJson<ArtifactCacheEntry>(`${baseUrl}cache?key=${key}&version=${version}`)
    const archiveLocation = r?.result?.archiveLocation
    if (!archiveLocation) {
        return null
    }

    const hc = new HttpClient('bazel-github-actions-cache')
    const res = await hc.get(archiveLocation)
    if (!isSuccessfulStatusCode(res.message.statusCode)) {
        res.message.resume()
        return null
    }
    return res.message
}

function main() {
    const server = http.createServer();
    let n_get: number = 0;
    let n_get_hit: number = 0;
    let n_put: number = 0;
    let n_put_succ: number = 0;
    let n_put_bytes: number = 0;

    const actions_cache_url = process.env.ACTIONS_CACHE_URL || 'http://localhost:3056/';
    const baseUrl = `${ actions_cache_url }_apis/artifactcache/`;
    const token = process.env.ACTIONS_RUNTIME_TOKEN;
    console.log(`baseUrl: ${ baseUrl }`);
    const httpClient = new HttpClient(
        'bazel-github-actions-cache',
        [new BearerCredentialHandler(token)],
        {
            headers : {
                Accept: 'application/json;api-version=6.0-preview.1'
            }
        }
    )

    server.on('request', async (request, response) => {
        const url = parse(request.url);
        if (url.pathname == '/close') {
            server.close();
            response.writeHead(200);
            response.end(`Stats: ${n_get_hit} / ${n_get} == ${n_get_hit * 100 / (n_get? n_get: 1)}%, Upload: ${n_put_succ} / ${n_put}, ${n_put_bytes} bytes\n` + errorBuffer.join('\n'));
        } else if (url.pathname.startsWith('/_apis/artifactcache/')) {
            response.writeHead(404);
            response.end();
        } else if (url.pathname.startsWith('/cas/') || url.pathname.startsWith('/ac/')) {
            const cas = url.pathname.startsWith('/cas/')
            const hash = url.pathname.substring(cas? 5: 4);
            const type = cas? 'cas': 'ac'
            if (request.method == 'PUT') {
                n_put += 1
                const size = Number(request.headers['content-length'])
                let succ: boolean
                try {
                    succ = await putCache(httpClient, baseUrl, type, hash, size, request)
                } catch (e) {
                    debug("put exc: " + e.message)
                }
                if (succ) {
                    n_put_succ += 1
                    n_put_bytes += size
                    response.writeHead(200)
                } else {
                    response.writeHead(500)
                }
                response.end()
            } else if (request.method == 'GET') {
                n_get += 1
                let stream: NodeJS.ReadableStream | null
                try {
                    stream = await getCache(httpClient, baseUrl, type, hash)
                } catch (e) {
                    debug("get exc: " + e.message)
                }
                if (stream) {
                    n_get_hit += 1
                    response.writeHead(200, {
                        'Content-Type': 'application/octet-stream'
                    })
                    stream.pipe(response)
                } else {
                    response.writeHead(404)
                    response.end()
                }
            } else {
                response.writeHead(400)
                response.end()
            }
        } else {
            response.writeHead(404);
            response.end();
        }
    });

    server.on('close', () => {
        console.log(`Goodbye: ${n_get_hit}, ${n_get}, ${n_put}, ${n_put_succ}, ${n_put_bytes}`)
    });

    server.listen(3055);
}
