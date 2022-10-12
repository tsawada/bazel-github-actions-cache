import * as http from 'http'
import * as https from 'https'
import { parse } from 'url'
import { spawn } from 'child_process'
import { HttpClient } from '@actions/http-client'
import { BearerCredentialHandler } from '@actions/http-client/lib/auth'

console.log("hello, world!");

if (!process.env.IS_BACKGROUND) {
    console.log('spawning');
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

function main() {
    const server = http.createServer();
    let n_req: number = 0;
    let n_hit: number = 0;
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
            response.end(`Stats: ${ n_hit } / ${ n_req } == ${ n_hit * 100 / (n_req? n_req: 1) }%, Upload: ${ n_put_succ } / ${n_put}, ${n_put_bytes} bytes`);
        } else if (url.pathname.startsWith('/_apis/artifactcache/')) {
            response.writeHead(404);
            response.end();
        } else if (url.pathname.startsWith('/cas/')) {
            const hash = url.pathname.substring(5);
            const key = `cas-${hash}`
            const version = 'a'
            if (request.method == 'PUT') {
                n_put += 1
                const l = Number(request.headers['content-length'])
                try {
                    const reserveCacheRequest: ReserveCacheRequest = {
                        key: key,
                        version: version,
                        cacheSize: l
                    }
                    const r = await httpClient.postJson<ReserveCacheResponse>(`${baseUrl}caches`, reserveCacheRequest)
                    const cacheId = r?.result?.cacheId
                    if (!cacheId) {
                        response.writeHead(500)
                        response.end()
                        return
                    }
                    const r2 = await httpClient.sendStream('PATCH', `${baseUrl}caches/${cacheId}`, request, {
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': `bytes 0-${l-1}/*`
                    })
                    if (!isSuccessfulStatusCode(r2.message.statusCode)) {
                        response.writeHead(500)
                        response.end()
                        return
                    }
                    n_put_succ += 1
                    n_put_bytes += l
                    response.writeHead(200)
                    response.end()
                } catch (e) {
                    //console.log(e)
                }
                response.writeHead(500)
                response.end()
                return
            }
            if (request.method != 'GET') {
                response.writeHead(404);
                response.end();
                return
            }
            n_req += 1;
            try {
                const r = await httpClient.getJson<ArtifactCacheEntry>(`${baseUrl}cache?key=${key}&version=a`)
                const archiveLocation = r?.result?.archiveLocation
                if (!archiveLocation) {
                    response.writeHead(404);
                    response.end()
                }
                https.get(archiveLocation, {}, (r) => {
                    if (r.statusCode < 200 || 300 <= r.statusCode) {
                        r.resume()
                        response.writeHead(404)
                        response.end()
                        return
                    }
                    n_hit += 1
                    response.writeHead(200)
                    r.pipe(response)
                }).on('error', (e) => {
                    response.writeHead(404)
                    response.end()
                })
            } catch (e) {
                //console.log(e)
            }
        } else {
            n_req += 1;
            response.writeHead(404);
            response.end();
        }
    });

    server.on('close', () => {
        console.log("Goodbye! %d / %d == %f%%", n_hit, n_req, n_hit * 100 / (n_req? n_req: 1))
    });

    server.listen(3055);
}
