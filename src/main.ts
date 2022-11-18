import { spawn } from 'child_process'
import * as core from '@actions/core'
import { ActionsCache } from './ActionsCache'
import { HttpServer } from './HttpServer'
import { Server, ServerCredentials } from '@grpc/grpc-js';
import { addService } from './GrpcServer';

const errorBuffer = []
function debug(message: string) {
    core.debug(message)
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

function main() {
    const actions_cache_url = process.env.ACTIONS_CACHE_URL || 'http://localhost:3056/';
    const baseUrl = `${ actions_cache_url }_apis/artifactcache/`;
    const token = process.env.ACTIONS_RUNTIME_TOKEN ?? '';

    const actionsCache = new ActionsCache(baseUrl, token);
    const httpServer = new HttpServer(actionsCache);

    const grpcServer = new Server()
    addService(grpcServer, actionsCache)
    grpcServer.bindAsync('0.0.0.0:4000', ServerCredentials.createInsecure(), () => {
        grpcServer.start()
    })

    httpServer.on('close', () => {
        console.log("Goodbye: " + JSON.stringify(httpServer.getStats()))
        grpcServer.tryShutdown(() => {})
    });

    httpServer.listen(3055);
}
