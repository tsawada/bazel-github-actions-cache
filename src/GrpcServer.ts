import * as grpc from '@grpc/grpc-js';
//import * as remote_execution from '../build/bazel/remote/execution/v2/remote_execution_patched';
//import * as semver from '../build/bazel/semver/semver';
import * as remote_execution from '../bazel-bin/build/bazel/remote/execution/v2/remote_execution_patched';
import * as semver from '../bazel-bin/build/bazel/semver/semver';
import { ActionsCache } from './ActionsCache'

import rev2 = remote_execution.build.bazel.remote.execution.v2
import SemVer = semver.build.bazel.semver.SemVer

class CapabilitiesService extends rev2.UnimplementedCapabilitiesService {
    GetCapabilities(call: grpc.ServerUnaryCall<rev2.GetCapabilitiesRequest, rev2.ServerCapabilities>, callback: grpc.requestCallback<rev2.ServerCapabilities>): void {
        console.log("GetCapabilities")
        callback(null, new rev2.ServerCapabilities({
            cache_capabilities: new rev2.CacheCapabilities({
                digest_functions: [rev2.DigestFunction.Value.SHA256],
                action_cache_update_capabilities: new rev2.ActionCacheUpdateCapabilities({
                    update_enabled: true,
                }),
            }),
            low_api_version: new SemVer({major: 2}),
            high_api_version: new SemVer({major: 2, minor: 1})
        }))
    }
}

class ActionCacheService extends rev2.UnimplementedActionCacheService {
    actionsCache: ActionsCache
    
    constructor(actionsCache: ActionsCache) {
        super()
        this.actionsCache = actionsCache
    }
    GetActionResult(call: grpc.ServerUnaryCall<rev2.GetActionResultRequest, rev2.ActionResult>, callback: grpc.sendUnaryData<rev2.ActionResult>): void {
        const d = call.request.action_digest
    }
}

export function addService(grpcServer: grpc.Server, actionsCache: ActionsCache) {
    grpcServer.addService(CapabilitiesService.definition, new CapabilitiesService())
    grpcServer.addService(ActionCacheService.definition, new ActionCacheService(actionsCache))
}
