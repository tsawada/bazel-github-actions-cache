import * as http from 'http'
import { parse } from 'url'
import { ActionsCache } from './ActionsCache'

export class HttpServer extends http.Server {
    n_get: number = 0
    n_get_hit: number = 0
    n_put: number = 0
    n_put_succ: number = 0
    n_put_bytes: number = 0
    actionsCache: ActionsCache

    constructor(actionsCache: ActionsCache) {
        super()
        this.actionsCache = actionsCache
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

    async get_cas(request: http.IncomingMessage, response: http.ServerResponse) {
        const url = parse(request.url ?? '');
        const cas = url.pathname?.startsWith('/cas/') ?? false
        const hash = url.pathname?.substring(cas? 5: 4) ?? '';
        const type = cas? 'cas': 'ac'
        if (request.method == 'PUT') {
            this.n_put += 1
            const size = Number(request.headers['content-length'])
            let succ = false
            try {
                succ = await this.actionsCache.putCache(type, hash, size, request)
            } catch (e) {
                // debug("put exc: " + e.message)
            }
            if (succ) {
                this.n_put_succ += 1
                this.n_put_bytes += size
                response.writeHead(200)
            } else {
                response.writeHead(500)
            }
            response.end()
        } else if (request.method == 'GET') {
            this.n_get += 1
            let url = await this.actionsCache.getCache(type, hash)
            if (url) {
                this.n_get_hit += 1
                response.writeHead(302, 'Found', {
                    Location: url
                })
            } else {
                response.writeHead(404)
            }
            response.end()
        }
    }

    async onRequest(request: http.IncomingMessage, response: http.ServerResponse) {
        const url = parse(request.url ?? '');
        if (url.pathname == '/close') {
            this.get_close(request, response)
        } else if (url.pathname?.startsWith('/_apis/artifactcache/')) {
            response.writeHead(404);
            response.end();
        } else if (url.pathname?.startsWith('/cas/') || url.pathname?.startsWith('/ac/')) {
            this.get_cas(request, response)
        } else {
            response.writeHead(404);
            response.end();
        }
    }
}
