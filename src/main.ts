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

/*
async function getJson<T>(url: string, options: Object): Promise<T> {
    return new Promise((resolve, reject) => {
        https.get(url, options, (response) => {
            if (response.statusCode < 200 || 300 <= response.statusCode) {
                reject({});
                return;
            }
            let b = Buffer.alloc(0);
            response.on('data', (chunk: Buffer) => {
                b = Buffer.concat([b, chunk]);
            })
            response.on('end', () => {
                resolve(JSON.parse(b.toString()))
            })
        }).on('error', (e) => {
            reject(e);
        });
    });
}

async function postJson<T>(url: string, options: Object): Promise<T> {

}
*/

function main() {
    const server = http.createServer();
    let n_req: number = 0;
    let n_hit: number = 0;
    let n_put: number = 0;

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
            response.end(`Stats: ${ n_hit } / ${ n_req } == ${ n_hit * 100 / (n_req? n_req: 1) }%`);
        } else if (url.pathname.startsWith('/_apis/artifactcache/')) {
            response.writeHead(404);
            response.end();
        } else if (url.pathname.startsWith('/cas/')) {
            if (request.method != 'GET') {
                response.writeHead(404);
                response.end();
            }
            n_req += 1;
            const hash = url.pathname.substring(5);
            const r = await httpClient.getJson<ArtifactCacheEntry>(`${baseUrl}cache?key=cas-${hash}&version=a`)
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
