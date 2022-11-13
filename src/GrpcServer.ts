import * as grpc from '@grpc/grpc-js';
import * as remote_execution from '../build/bazel/remote/execution/v2/remote_execution_patched';

import rev2 = remote_execution.build.bazel.remote.execution.v2

export class CapabilitiesService extends rev2.UnimplementedCapabilitiesService {
    GetCapabilities(call: grpc.ServerUnaryCall<rev2.GetCapabilitiesRequest, rev2.ServerCapabilities>, callback: grpc.requestCallback<rev2.ServerCapabilities>): void {
        console.log("GetCapabilities")
        callback(null, new rev2.ServerCapabilities({
           cache_capabilities: new rev2.CacheCapabilities({

           })
        }))
    }
}
