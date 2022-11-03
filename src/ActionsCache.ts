import { HttpClient } from '@actions/http-client'
import { BearerCredentialHandler } from '@actions/http-client/lib/auth'

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

export class ActionsCache {
    baseUrl: string
    token: string
    httpClient: HttpClient

    constructor(baseUrl: string, token: string) {
        this.baseUrl = baseUrl
        this.token = token
        this.httpClient = new HttpClient(
            'bazel-github-actions-cache',
            [new BearerCredentialHandler(token)],
            {
                headers: {
                    Accept: 'application/json;api-version=6.0-preview.1'
                }
            }
        )
    }

    async putCache(type: string, hash: string, size: number, stream: NodeJS.ReadableStream): Promise<boolean> {
        const key = `${type}-${hash}`
        const version = 'b'
        const reserveCacheRequest: ReserveCacheRequest = {
            key: key,
            version: version,
            cacheSize: size
        }
        const r = await this.httpClient.postJson<ReserveCacheResponse>(`${this.baseUrl}caches`, reserveCacheRequest)
        const cacheId = r?.result?.cacheId
        if (!cacheId) {
            // debug(`ReserveCache failed: ${r.statusCode}`)
            stream.resume()
            return false;
        }
        const upload = await this.httpClient.sendStream('PATCH', `${this.baseUrl}caches/${cacheId}`, stream, {
            'Content-Type': 'application/octet-stream',
            'Content-Range': `bytes 0-${size-1}/*`
        })
        if (!isSuccessfulStatusCode(upload.message.statusCode)) {
            // debug(`Upload failed: ${upload.message.statusMessage}`)
            stream.resume()
            return false
        }
        const commitCacheRequest: CommitCacheRequest = { size: size }
        const commit = await this.httpClient.postJson<null>(`${this.baseUrl}caches/${cacheId}`, commitCacheRequest)
        if (!isSuccessfulStatusCode(commit.statusCode)) {
            // core.debug(`Commit failed: ${commit.statusCode}`)
            return false
        }
        return true
    }

    async getCache(type: string, hash: string): Promise<NodeJS.ReadableStream | null> {
        const key = `${type}-${hash}`
        const version = 'b'

        const r = await this.httpClient.getJson<ArtifactCacheEntry>(`${this.baseUrl}cache?keys=${key}&version=${version}`)
        const archiveLocation = r?.result?.archiveLocation
        if (!archiveLocation) {
            // debug(`Entry failed: ${r.statusCode}`)
            return null
        }

        const hc = new HttpClient('bazel-github-actions-cache')
        const res = await hc.get(archiveLocation)
        if (!isSuccessfulStatusCode(res.message.statusCode)) {
            // debug(`Blob failed: ${res.message.statusMessage}`)
            res.message.resume()
            return null
        }
        return res.message
    }
}
