import { HttpClient } from '@actions/http-client'
import { BearerCredentialHandler } from '@actions/http-client/lib/auth'

interface ArtifactCacheEntry {
    cacheKey?: string
    scope?: string
    creationTime?: string
    archiveLocation?: string
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
    version: string
    httpClient: HttpClient

    constructor(baseUrl: string, token: string, version: string) {
        this.baseUrl = baseUrl
        this.token = token
        this.version = version
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

    async reserve(type: string, hash: string, size: number): Promise<number | undefined> {
        const key = `${type}-${hash}`
        const r = await this.httpClient.postJson<ReserveCacheResponse>(`${this.baseUrl}caches`, {
            key: key,
            version: this.version,
            cacheSize: size
        })
        return r.result?.cacheId
    }

    async upload(cacheId: number, size: number, stream: NodeJS.ReadableStream): Promise<boolean> {
        const r = await this.httpClient.sendStream('PATCH', `${this.baseUrl}caches/${cacheId}`, stream, {
            'Content-Type': 'application/octet-stream',
            'Content-Range': `bytes 0-${size-1}/*`
        })
        if (!isSuccessfulStatusCode(r.message.statusCode)) {
            // debug(`Upload failed: ${upload.message.statusMessage}`)
            stream.resume()
            return false
        }
        return true
    }

    async commit(cacheId: number, size: number): Promise<boolean> {
        const commit = await this.httpClient.postJson<null>(`${this.baseUrl}caches/${cacheId}`, { size: size })
        if (!isSuccessfulStatusCode(commit.statusCode)) {
            // core.debug(`Commit failed: ${commit.statusCode}`)
            return false
        }
        return true
    }

    async exists(type: string, hash: string): Promise<boolean> {
        const key = `${type}-${hash}`
        const head = await this.httpClient.head(`${this.baseUrl}cache?keys=${key}&version=${this.version}`)
        return isSuccessfulStatusCode(head.message.statusCode)
    }

    async getLocation(type: string, hash: string): Promise<string | undefined> {
        const key = `${type}-${hash}`
        const r = await this.httpClient.getJson<ArtifactCacheEntry>(`${this.baseUrl}cache?keys=${key}&version=${this.version}`)
        return r?.result?.archiveLocation
    }
}
