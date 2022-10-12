"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var http = require("http");
var url_1 = require("url");
var child_process_1 = require("child_process");
var http_client_1 = require("@actions/http-client");
var auth_1 = require("@actions/http-client/lib/auth");
console.log("hello, world!");
if (!process.env.IS_BACKGROUND) {
    console.log('spawning');
    var child = (0, child_process_1.spawn)(process.execPath, process.argv.slice(1), {
        detached: true,
        stdio: 'inherit',
        env: __assign(__assign({}, process.env), { IS_BACKGROUND: '1' })
    });
    child.unref();
}
else {
    main();
}
function isSuccessfulStatusCode(statusCode) {
    if (!statusCode) {
        return false;
    }
    return 200 <= statusCode && statusCode < 300;
}
function putCache(httpClient, baseUrl, type, hash, size, stream) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var key, version, reserveCacheRequest, r, cacheId, r2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    key = "".concat(type, "-").concat(hash);
                    version = 'a';
                    reserveCacheRequest = {
                        key: key,
                        version: version,
                        cacheSize: size
                    };
                    return [4 /*yield*/, httpClient.postJson("".concat(baseUrl, "caches"), reserveCacheRequest)];
                case 1:
                    r = _b.sent();
                    cacheId = (_a = r === null || r === void 0 ? void 0 : r.result) === null || _a === void 0 ? void 0 : _a.cacheId;
                    if (!cacheId) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, httpClient.sendStream('PATCH', "".concat(baseUrl, "caches/").concat(cacheId), stream, {
                            'Content-Type': 'application/octet-stream',
                            'Content-Range': "bytes 0-".concat(size - 1, "/*")
                        })];
                case 2:
                    r2 = _b.sent();
                    if (!isSuccessfulStatusCode(r2.message.statusCode)) {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
function getCache(httpClient, baseUrl, type, hash) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var key, version, r, archiveLocation, hc, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    key = "".concat(type, "-").concat(hash);
                    version = 'a';
                    return [4 /*yield*/, httpClient.getJson("".concat(baseUrl, "cache?key=").concat(key, "&version=").concat(version))];
                case 1:
                    r = _b.sent();
                    archiveLocation = (_a = r === null || r === void 0 ? void 0 : r.result) === null || _a === void 0 ? void 0 : _a.archiveLocation;
                    if (!archiveLocation) {
                        return [2 /*return*/, null];
                    }
                    hc = new http_client_1.HttpClient('bazel-github-actions-cache');
                    return [4 /*yield*/, hc.get(archiveLocation)];
                case 2:
                    res = _b.sent();
                    if (!isSuccessfulStatusCode(res.message.statusCode)) {
                        res.message.resume();
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, res.message];
            }
        });
    });
}
function main() {
    var _this = this;
    var server = http.createServer();
    var n_get = 0;
    var n_get_hit = 0;
    var n_put = 0;
    var n_put_succ = 0;
    var n_put_bytes = 0;
    var actions_cache_url = process.env.ACTIONS_CACHE_URL || 'http://localhost:3056/';
    var baseUrl = "".concat(actions_cache_url, "_apis/artifactcache/");
    var token = process.env.ACTIONS_RUNTIME_TOKEN;
    console.log("baseUrl: ".concat(baseUrl));
    var httpClient = new http_client_1.HttpClient('bazel-github-actions-cache', [new auth_1.BearerCredentialHandler(token)], {
        headers: {
            Accept: 'application/json;api-version=6.0-preview.1'
        }
    });
    server.on('request', function (request, response) { return __awaiter(_this, void 0, void 0, function () {
        var url, cas, hash, type, size, succ, e_1, stream, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = (0, url_1.parse)(request.url);
                    if (!(url.pathname == '/close')) return [3 /*break*/, 1];
                    server.close();
                    response.writeHead(200);
                    response.end("Stats: ".concat(n_get_hit, " / ").concat(n_get, " == ").concat(n_get_hit * 100 / (n_get ? n_get : 1), "%, Upload: ").concat(n_put_succ, " / ").concat(n_put, ", ").concat(n_put_bytes, " bytes"));
                    return [3 /*break*/, 15];
                case 1:
                    if (!url.pathname.startsWith('/_apis/artifactcache/')) return [3 /*break*/, 2];
                    response.writeHead(404);
                    response.end();
                    return [3 /*break*/, 15];
                case 2:
                    if (!(url.pathname.startsWith('/cas/') || url.pathname.startsWith('/ac/'))) return [3 /*break*/, 14];
                    cas = url.pathname.startsWith('/cas/');
                    hash = url.pathname.substring(cas ? 5 : 4);
                    type = cas ? 'cas' : 'ac';
                    if (!(request.method == 'PUT')) return [3 /*break*/, 7];
                    n_put += 1;
                    size = Number(request.headers['content-length']);
                    succ = void 0;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, putCache(httpClient, baseUrl, type, hash, size, request)];
                case 4:
                    succ = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (succ) {
                        n_put_succ += 1;
                        n_put_bytes += size;
                        response.writeHead(200);
                    }
                    else {
                        response.writeHead(500);
                    }
                    response.end();
                    return [3 /*break*/, 13];
                case 7:
                    if (!(request.method == 'GET')) return [3 /*break*/, 12];
                    n_get += 1;
                    stream = void 0;
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, getCache(httpClient, baseUrl, type, hash)];
                case 9:
                    stream = _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_2 = _a.sent();
                    return [3 /*break*/, 11];
                case 11:
                    if (stream) {
                        n_get_hit += 1;
                        response.writeHead(200, {
                            'Content-Type': 'application/octet-stream'
                        });
                        stream.pipe(response);
                    }
                    else {
                        response.writeHead(404);
                        response.end();
                    }
                    return [3 /*break*/, 13];
                case 12:
                    response.writeHead(400);
                    response.end();
                    _a.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    response.writeHead(404);
                    response.end();
                    _a.label = 15;
                case 15: return [2 /*return*/];
            }
        });
    }); });
    server.on('close', function () {
        console.log("Goodbye: ".concat(n_get_hit, ", ").concat(n_get, ", ").concat(n_put, ", ").concat(n_put_succ, ", ").concat(n_put_bytes));
    });
    server.listen(3055);
}
