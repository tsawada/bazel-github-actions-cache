import * as http from 'http'
import { parse } from 'url'
import { spawn } from 'child_process'

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

function main() {
    const server = http.createServer();
    let n_req: number = 0;
    let n_hit: number = 0;
    let n_miss: number = 0;

    const baseUrl = process.env.ACTIONS_CACHE_URL + '/_apis/artifactcache/';
    const token = process.env.ACTIONS_RUNTIME_TOKEN;

    server.on('request', (request, response) => {
        const url = parse(request.url);
        console.log(url.pathname);
        if (url.pathname == '/close') {
            server.close();
            response.writeHead(200);
            response.end(`Stats: ${ n_hit } / ${ n_req } == ${ n_hit * 100 / (n_req? n_req: 1) }%`);
        } else if (url.pathname.startsWith('/cas/')) {
            n_req += 1;
            const hash = url.pathname.substring(5);
            http.get(baseUrl + 'cache?key=cas-' + hash, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            },
            (r) => {
                if (200 <= r.statusCode && r.statusCode < 300) {
                    n_hit += 1;
                    response.writeHead(200);
                    r.pipe(response);
                } else {
                    n_miss += 1;
                    response.writeHead(404);
                    response.end();
                }
            });
        } else {
            n_req += 1;
            n_miss += 1;
            response.writeHead(404);
            response.end();
        }
    });

    server.on('close', () => {
        console.log("Goodbye! %d / %d == %f%%", n_hit, n_req, n_hit * 100 / (n_req? n_req: 1))
    });

    server.listen(3055);
}
