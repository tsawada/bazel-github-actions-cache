import * as http from 'http'
import { parse } from 'url'
import { ActionsCache } from './ActionsCache'
import { HttpClient, HttpClientError } from '@actions/http-client'

export class HttpServer extends http.Server {
    n_get: number = 0
    n_get_hit: number = 0
    n_put: number = 0
    n_put_succ: number = 0
    n_put_bytes: number = 0
    actionsCache: ActionsCache
    httpClient: HttpClient

    constructor(actionsCache: ActionsCache) {
        super()
        this.actionsCache = actionsCache
        this.httpClient = new HttpClient('bazel-github-actions-cache')
        this.on('request', this.onRequest)
    }

    getStats() {
        return {
            "n_get": this.n_get,
            "n_get_hit": this.n_get_hit,
            "n_put": this.n_put,
            "n_put_succ": this.n_put_succ,
            "n_put_bytes": this.n_put_bytes
        }
    }

    get_close(request: http.IncomingMessage, response: http.ServerResponse) {
        this.close()
        response.writeHead(200, {
            "Content-type": "application/json"
        })
        response.end(JSON.stringify(this.getStats()))
    }

    handle_error(e: any, response: http.ServerResponse) {
        if (e instanceof HttpClientError) {
            response.writeHead(e.statusCode, e.message)
            response.write(e.result)
        } else if (e instanceof Error) {
            response.writeHead(500, "Internal Server Error")
            response.write(e)
        } else {
            response.writeHead(500, "Internal Server Error")
        }
        response.end()
    }

    async get_cache(type: string, hash: string, response: http.ServerResponse) {
        this.n_get += 1
        try {
            const loc = await this.actionsCache.getLocation(type, hash)
            if (!loc) {
                response.writeHead(404)
                response.end()
                return
            }
            const res = await this.httpClient.get(loc)
            if (res.message.statusCode != 200) {
                response.writeHead(res.message.statusCode || 500)
                response.end()
                return
            }
            this.n_get_hit += 1
            response.writeHead(200, {
                'Content-Type': 'application/octet-stream'
            })
            res.message.pipe(response)
        } catch (e) {
            this.handle_error(e, response)
            return
        }
    }

    async put_cache(type: string, hash: string, size: number, stream: NodeJS.ReadableStream, response: http.ServerResponse) {
        this.n_put += 1
        try {
            if (await this.actionsCache.exists(type, hash)) {
                response.writeHead(200)
                response.end()
                return
            }
            const cacheId = await this.actionsCache.reserve(type, hash, size)
            if (!cacheId) {
                stream.resume()
                response.writeHead(500)
                response.end()
                return
            }
            if (!await this.actionsCache.upload(cacheId, size, stream)) {
                stream.resume()
                response.writeHead(500)
                response.end()
                return
            }
            this.n_put_succ += 1
            this.n_put_bytes += size
        } catch (e) {
            this.handle_error(e, response)
            return
        }
        response.writeHead(200)
        response.end()
    }

    async cache(request: http.IncomingMessage, response: http.ServerResponse) {
        const url = parse(request.url ?? '');
        const cas = url.pathname?.startsWith('/cas/') ?? false
        const hash = url.pathname?.substring(cas? 5: 4) ?? '';
        const type = cas? 'cas': 'ac'
        if (request.method == 'PUT') {
            const size = Number(request.headers['content-length'])
            await this.put_cache(type, hash, size, request, response)
        } else if (request.method == 'GET') {
            await this.get_cache(type, hash, response)
        } else {
            response.writeHead(405, "Method Not Allowed")
            response.end()
        }
    }

    async onRequest(request: http.IncomingMessage, response: http.ServerResponse) {
        const url = parse(request.url ?? '');
        if (url.pathname == '/close') {
            this.get_close(request, response)
        } else if (url.pathname?.startsWith('/cas/') || url.pathname?.startsWith('/ac/')) {
            this.cache(request, response)
        } else {
            response.writeHead(404, "Not Found");
            response.end();
        }
    }
}
