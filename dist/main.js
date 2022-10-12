"use strict";var E=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var V=E(S=>{"use strict";Object.defineProperty(S,"__esModule",{value:!0});S.checkBypass=S.getProxyUrl=void 0;function he(r){let e=r.protocol==="https:";if(Y(r))return;let t=(()=>e?process.env.https_proxy||process.env.HTTPS_PROXY:process.env.http_proxy||process.env.HTTP_PROXY)();if(t)return new URL(t)}S.getProxyUrl=he;function Y(r){if(!r.hostname)return!1;let e=process.env.no_proxy||process.env.NO_PROXY||"";if(!e)return!1;let t;r.port?t=Number(r.port):r.protocol==="http:"?t=80:r.protocol==="https:"&&(t=443);let n=[r.hostname.toUpperCase()];typeof t=="number"&&n.push(`${n[0]}:${t}`);for(let i of e.split(",").map(s=>s.trim().toUpperCase()).filter(s=>s))if(n.some(s=>s===i))return!0;return!1}S.checkBypass=Y});var te=E(q=>{"use strict";var Le=require("net"),fe=require("tls"),J=require("http"),Q=require("https"),de=require("events"),Ce=require("assert"),pe=require("util");q.httpOverHttp=ve;q.httpsOverHttp=ge;q.httpOverHttps=me;q.httpsOverHttps=ye;function ve(r){var e=new R(r);return e.request=J.request,e}function ge(r){var e=new R(r);return e.request=J.request,e.createSocket=Z,e.defaultPort=443,e}function me(r){var e=new R(r);return e.request=Q.request,e}function ye(r){var e=new R(r);return e.request=Q.request,e.createSocket=Z,e.defaultPort=443,e}function R(r){var e=this;e.options=r||{},e.proxyOptions=e.options.proxy||{},e.maxSockets=e.options.maxSockets||J.Agent.defaultMaxSockets,e.requests=[],e.sockets=[],e.on("free",function(n,i,s,a){for(var c=ee(i,s,a),l=0,o=e.requests.length;l<o;++l){var u=e.requests[l];if(u.host===c.host&&u.port===c.port){e.requests.splice(l,1),u.request.onSocket(n);return}}n.destroy(),e.removeSocket(n)})}pe.inherits(R,de.EventEmitter);R.prototype.addRequest=function(e,t,n,i){var s=this,a=j({request:e},s.options,ee(t,n,i));if(s.sockets.length>=this.maxSockets){s.requests.push(a);return}s.createSocket(a,function(c){c.on("free",l),c.on("close",o),c.on("agentRemove",o),e.onSocket(c);function l(){s.emit("free",c,a)}function o(u){s.removeSocket(c),c.removeListener("free",l),c.removeListener("close",o),c.removeListener("agentRemove",o)}})};R.prototype.createSocket=function(e,t){var n=this,i={};n.sockets.push(i);var s=j({},n.proxyOptions,{method:"CONNECT",path:e.host+":"+e.port,agent:!1,headers:{host:e.host+":"+e.port}});e.localAddress&&(s.localAddress=e.localAddress),s.proxyAuth&&(s.headers=s.headers||{},s.headers["Proxy-Authorization"]="Basic "+new Buffer(s.proxyAuth).toString("base64")),A("making CONNECT request");var a=n.request(s);a.useChunkedEncodingByDefault=!1,a.once("response",c),a.once("upgrade",l),a.once("connect",o),a.once("error",u),a.end();function c(h){h.upgrade=!0}function l(h,f,v){process.nextTick(function(){o(h,f,v)})}function o(h,f,v){if(a.removeAllListeners(),f.removeAllListeners(),h.statusCode!==200){A("tunneling socket could not be established, statusCode=%d",h.statusCode),f.destroy();var m=new Error("tunneling socket could not be established, statusCode="+h.statusCode);m.code="ECONNRESET",e.request.emit("error",m),n.removeSocket(i);return}if(v.length>0){A("got illegal response body from proxy"),f.destroy();var m=new Error("got illegal response body from proxy");m.code="ECONNRESET",e.request.emit("error",m),n.removeSocket(i);return}return A("tunneling connection has established"),n.sockets[n.sockets.indexOf(i)]=f,t(f)}function u(h){a.removeAllListeners(),A(`tunneling socket could not be established, cause=%s
`,h.message,h.stack);var f=new Error("tunneling socket could not be established, cause="+h.message);f.code="ECONNRESET",e.request.emit("error",f),n.removeSocket(i)}};R.prototype.removeSocket=function(e){var t=this.sockets.indexOf(e);if(t!==-1){this.sockets.splice(t,1);var n=this.requests.shift();n&&this.createSocket(n,function(i){n.request.onSocket(i)})}};function Z(r,e){var t=this;R.prototype.createSocket.call(t,r,function(n){var i=r.request.getHeader("host"),s=j({},t.options,{socket:n,servername:i?i.replace(/:.*$/,""):r.host}),a=fe.connect(0,s);t.sockets[t.sockets.indexOf(n)]=a,e(a)})}function ee(r,e,t){return typeof r=="string"?{host:r,port:e,localAddress:t}:r}function j(r){for(var e=1,t=arguments.length;e<t;++e){var n=arguments[e];if(typeof n=="object")for(var i=Object.keys(n),s=0,a=i.length;s<a;++s){var c=i[s];n[c]!==void 0&&(r[c]=n[c])}}return r}var A;process.env.NODE_DEBUG&&/\btunnel\b/.test(process.env.NODE_DEBUG)?A=function(){var r=Array.prototype.slice.call(arguments);typeof r[0]=="string"?r[0]="TUNNEL: "+r[0]:r.unshift("TUNNEL:"),console.error.apply(console,r)}:A=function(){};q.debug=A});var ne=E((je,re)=>{re.exports=te()});var ie=E(d=>{"use strict";var we=d&&d.__createBinding||(Object.create?function(r,e,t,n){n===void 0&&(n=t),Object.defineProperty(r,n,{enumerable:!0,get:function(){return e[t]}})}:function(r,e,t,n){n===void 0&&(n=t),r[n]=e[t]}),_e=d&&d.__setModuleDefault||(Object.create?function(r,e){Object.defineProperty(r,"default",{enumerable:!0,value:e})}:function(r,e){r.default=e}),B=d&&d.__importStar||function(r){if(r&&r.__esModule)return r;var e={};if(r!=null)for(var t in r)t!=="default"&&Object.hasOwnProperty.call(r,t)&&we(e,r,t);return _e(e,r),e},p=d&&d.__awaiter||function(r,e,t,n){function i(s){return s instanceof t?s:new t(function(a){a(s)})}return new(t||(t=Promise))(function(s,a){function c(u){try{o(n.next(u))}catch(h){a(h)}}function l(u){try{o(n.throw(u))}catch(h){a(h)}}function o(u){u.done?s(u.value):i(u.value).then(c,l)}o((n=n.apply(r,e||[])).next())})};Object.defineProperty(d,"__esModule",{value:!0});d.HttpClient=d.isHttps=d.HttpClientResponse=d.HttpClientError=d.getProxyUrl=d.MediaTypes=d.Headers=d.HttpCodes=void 0;var k=B(require("http")),G=B(require("https")),se=B(V()),P=B(ne()),w;(function(r){r[r.OK=200]="OK",r[r.MultipleChoices=300]="MultipleChoices",r[r.MovedPermanently=301]="MovedPermanently",r[r.ResourceMoved=302]="ResourceMoved",r[r.SeeOther=303]="SeeOther",r[r.NotModified=304]="NotModified",r[r.UseProxy=305]="UseProxy",r[r.SwitchProxy=306]="SwitchProxy",r[r.TemporaryRedirect=307]="TemporaryRedirect",r[r.PermanentRedirect=308]="PermanentRedirect",r[r.BadRequest=400]="BadRequest",r[r.Unauthorized=401]="Unauthorized",r[r.PaymentRequired=402]="PaymentRequired",r[r.Forbidden=403]="Forbidden",r[r.NotFound=404]="NotFound",r[r.MethodNotAllowed=405]="MethodNotAllowed",r[r.NotAcceptable=406]="NotAcceptable",r[r.ProxyAuthenticationRequired=407]="ProxyAuthenticationRequired",r[r.RequestTimeout=408]="RequestTimeout",r[r.Conflict=409]="Conflict",r[r.Gone=410]="Gone",r[r.TooManyRequests=429]="TooManyRequests",r[r.InternalServerError=500]="InternalServerError",r[r.NotImplemented=501]="NotImplemented",r[r.BadGateway=502]="BadGateway",r[r.ServiceUnavailable=503]="ServiceUnavailable",r[r.GatewayTimeout=504]="GatewayTimeout"})(w=d.HttpCodes||(d.HttpCodes={}));var g;(function(r){r.Accept="accept",r.ContentType="content-type"})(g=d.Headers||(d.Headers={}));var O;(function(r){r.ApplicationJson="application/json"})(O=d.MediaTypes||(d.MediaTypes={}));function Re(r){let e=se.getProxyUrl(new URL(r));return e?e.href:""}d.getProxyUrl=Re;var be=[w.MovedPermanently,w.ResourceMoved,w.SeeOther,w.TemporaryRedirect,w.PermanentRedirect],Ae=[w.BadGateway,w.ServiceUnavailable,w.GatewayTimeout],Oe=["OPTIONS","GET","DELETE","HEAD"],Se=10,qe=5,T=class extends Error{constructor(e,t){super(e),this.name="HttpClientError",this.statusCode=t,Object.setPrototypeOf(this,T.prototype)}};d.HttpClientError=T;var N=class{constructor(e){this.message=e}readBody(){return p(this,void 0,void 0,function*(){return new Promise(e=>p(this,void 0,void 0,function*(){let t=Buffer.alloc(0);this.message.on("data",n=>{t=Buffer.concat([t,n])}),this.message.on("end",()=>{e(t.toString())})}))})}};d.HttpClientResponse=N;function Te(r){return new URL(r).protocol==="https:"}d.isHttps=Te;var I=class{constructor(e,t,n){this._ignoreSslError=!1,this._allowRedirects=!0,this._allowRedirectDowngrade=!1,this._maxRedirects=50,this._allowRetries=!1,this._maxRetries=1,this._keepAlive=!1,this._disposed=!1,this.userAgent=e,this.handlers=t||[],this.requestOptions=n,n&&(n.ignoreSslError!=null&&(this._ignoreSslError=n.ignoreSslError),this._socketTimeout=n.socketTimeout,n.allowRedirects!=null&&(this._allowRedirects=n.allowRedirects),n.allowRedirectDowngrade!=null&&(this._allowRedirectDowngrade=n.allowRedirectDowngrade),n.maxRedirects!=null&&(this._maxRedirects=Math.max(n.maxRedirects,0)),n.keepAlive!=null&&(this._keepAlive=n.keepAlive),n.allowRetries!=null&&(this._allowRetries=n.allowRetries),n.maxRetries!=null&&(this._maxRetries=n.maxRetries))}options(e,t){return p(this,void 0,void 0,function*(){return this.request("OPTIONS",e,null,t||{})})}get(e,t){return p(this,void 0,void 0,function*(){return this.request("GET",e,null,t||{})})}del(e,t){return p(this,void 0,void 0,function*(){return this.request("DELETE",e,null,t||{})})}post(e,t,n){return p(this,void 0,void 0,function*(){return this.request("POST",e,t,n||{})})}patch(e,t,n){return p(this,void 0,void 0,function*(){return this.request("PATCH",e,t,n||{})})}put(e,t,n){return p(this,void 0,void 0,function*(){return this.request("PUT",e,t,n||{})})}head(e,t){return p(this,void 0,void 0,function*(){return this.request("HEAD",e,null,t||{})})}sendStream(e,t,n,i){return p(this,void 0,void 0,function*(){return this.request(e,t,n,i)})}getJson(e,t={}){return p(this,void 0,void 0,function*(){t[g.Accept]=this._getExistingOrDefaultHeader(t,g.Accept,O.ApplicationJson);let n=yield this.get(e,t);return this._processResponse(n,this.requestOptions)})}postJson(e,t,n={}){return p(this,void 0,void 0,function*(){let i=JSON.stringify(t,null,2);n[g.Accept]=this._getExistingOrDefaultHeader(n,g.Accept,O.ApplicationJson),n[g.ContentType]=this._getExistingOrDefaultHeader(n,g.ContentType,O.ApplicationJson);let s=yield this.post(e,i,n);return this._processResponse(s,this.requestOptions)})}putJson(e,t,n={}){return p(this,void 0,void 0,function*(){let i=JSON.stringify(t,null,2);n[g.Accept]=this._getExistingOrDefaultHeader(n,g.Accept,O.ApplicationJson),n[g.ContentType]=this._getExistingOrDefaultHeader(n,g.ContentType,O.ApplicationJson);let s=yield this.put(e,i,n);return this._processResponse(s,this.requestOptions)})}patchJson(e,t,n={}){return p(this,void 0,void 0,function*(){let i=JSON.stringify(t,null,2);n[g.Accept]=this._getExistingOrDefaultHeader(n,g.Accept,O.ApplicationJson),n[g.ContentType]=this._getExistingOrDefaultHeader(n,g.ContentType,O.ApplicationJson);let s=yield this.patch(e,i,n);return this._processResponse(s,this.requestOptions)})}request(e,t,n,i){return p(this,void 0,void 0,function*(){if(this._disposed)throw new Error("Client has already been disposed.");let s=new URL(t),a=this._prepareRequest(e,s,i),c=this._allowRetries&&Oe.includes(e)?this._maxRetries+1:1,l=0,o;do{if(o=yield this.requestRaw(a,n),o&&o.message&&o.message.statusCode===w.Unauthorized){let h;for(let f of this.handlers)if(f.canHandleAuthentication(o)){h=f;break}return h?h.handleAuthentication(this,a,n):o}let u=this._maxRedirects;for(;o.message.statusCode&&be.includes(o.message.statusCode)&&this._allowRedirects&&u>0;){let h=o.message.headers.location;if(!h)break;let f=new URL(h);if(s.protocol==="https:"&&s.protocol!==f.protocol&&!this._allowRedirectDowngrade)throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");if(yield o.readBody(),f.hostname!==s.hostname)for(let v in i)v.toLowerCase()==="authorization"&&delete i[v];a=this._prepareRequest(e,f,i),o=yield this.requestRaw(a,n),u--}if(!o.message.statusCode||!Ae.includes(o.message.statusCode))return o;l+=1,l<c&&(yield o.readBody(),yield this._performExponentialBackoff(l))}while(l<c);return o})}dispose(){this._agent&&this._agent.destroy(),this._disposed=!0}requestRaw(e,t){return p(this,void 0,void 0,function*(){return new Promise((n,i)=>{function s(a,c){a?i(a):c?n(c):i(new Error("Unknown error"))}this.requestRawWithCallback(e,t,s)})})}requestRawWithCallback(e,t,n){typeof t=="string"&&(e.options.headers||(e.options.headers={}),e.options.headers["Content-Length"]=Buffer.byteLength(t,"utf8"));let i=!1;function s(l,o){i||(i=!0,n(l,o))}let a=e.httpModule.request(e.options,l=>{let o=new N(l);s(void 0,o)}),c;a.on("socket",l=>{c=l}),a.setTimeout(this._socketTimeout||3*6e4,()=>{c&&c.end(),s(new Error(`Request timeout: ${e.options.path}`))}),a.on("error",function(l){s(l)}),t&&typeof t=="string"&&a.write(t,"utf8"),t&&typeof t!="string"?(t.on("close",function(){a.end()}),t.pipe(a)):a.end()}getAgent(e){let t=new URL(e);return this._getAgent(t)}_prepareRequest(e,t,n){let i={};i.parsedUrl=t;let s=i.parsedUrl.protocol==="https:";i.httpModule=s?G:k;let a=s?443:80;if(i.options={},i.options.host=i.parsedUrl.hostname,i.options.port=i.parsedUrl.port?parseInt(i.parsedUrl.port):a,i.options.path=(i.parsedUrl.pathname||"")+(i.parsedUrl.search||""),i.options.method=e,i.options.headers=this._mergeHeaders(n),this.userAgent!=null&&(i.options.headers["user-agent"]=this.userAgent),i.options.agent=this._getAgent(i.parsedUrl),this.handlers)for(let c of this.handlers)c.prepareRequest(i.options);return i}_mergeHeaders(e){return this.requestOptions&&this.requestOptions.headers?Object.assign({},U(this.requestOptions.headers),U(e||{})):U(e||{})}_getExistingOrDefaultHeader(e,t,n){let i;return this.requestOptions&&this.requestOptions.headers&&(i=U(this.requestOptions.headers)[t]),e[t]||i||n}_getAgent(e){let t,n=se.getProxyUrl(e),i=n&&n.hostname;if(this._keepAlive&&i&&(t=this._proxyAgent),this._keepAlive&&!i&&(t=this._agent),t)return t;let s=e.protocol==="https:",a=100;if(this.requestOptions&&(a=this.requestOptions.maxSockets||k.globalAgent.maxSockets),n&&n.hostname){let c={maxSockets:a,keepAlive:this._keepAlive,proxy:Object.assign(Object.assign({},(n.username||n.password)&&{proxyAuth:`${n.username}:${n.password}`}),{host:n.hostname,port:n.port})},l,o=n.protocol==="https:";s?l=o?P.httpsOverHttps:P.httpsOverHttp:l=o?P.httpOverHttps:P.httpOverHttp,t=l(c),this._proxyAgent=t}if(this._keepAlive&&!t){let c={keepAlive:this._keepAlive,maxSockets:a};t=s?new G.Agent(c):new k.Agent(c),this._agent=t}return t||(t=s?G.globalAgent:k.globalAgent),s&&this._ignoreSslError&&(t.options=Object.assign(t.options||{},{rejectUnauthorized:!1})),t}_performExponentialBackoff(e){return p(this,void 0,void 0,function*(){e=Math.min(Se,e);let t=qe*Math.pow(2,e);return new Promise(n=>setTimeout(()=>n(),t))})}_processResponse(e,t){return p(this,void 0,void 0,function*(){return new Promise((n,i)=>p(this,void 0,void 0,function*(){let s=e.message.statusCode||0,a={statusCode:s,result:null,headers:{}};s===w.NotFound&&n(a);function c(u,h){if(typeof h=="string"){let f=new Date(h);if(!isNaN(f.valueOf()))return f}return h}let l,o;try{o=yield e.readBody(),o&&o.length>0&&(t&&t.deserializeDates?l=JSON.parse(o,c):l=JSON.parse(o),a.result=l),a.headers=e.message.headers}catch(u){}if(s>299){let u;l&&l.message?u=l.message:o&&o.length>0?u=o:u=`Failed request: (${s})`;let h=new T(u,s);h.result=a.result,i(h)}else n(a)}))})}};d.HttpClient=I;var U=r=>Object.keys(r).reduce((e,t)=>(e[t.toLowerCase()]=r[t],e),{})});var oe=E(_=>{"use strict";var K=_&&_.__awaiter||function(r,e,t,n){function i(s){return s instanceof t?s:new t(function(a){a(s)})}return new(t||(t=Promise))(function(s,a){function c(u){try{o(n.next(u))}catch(h){a(h)}}function l(u){try{o(n.throw(u))}catch(h){a(h)}}function o(u){u.done?s(u.value):i(u.value).then(c,l)}o((n=n.apply(r,e||[])).next())})};Object.defineProperty(_,"__esModule",{value:!0});_.PersonalAccessTokenCredentialHandler=_.BearerCredentialHandler=_.BasicCredentialHandler=void 0;var z=class{constructor(e,t){this.username=e,this.password=t}prepareRequest(e){if(!e.headers)throw Error("The request has no headers");e.headers.Authorization=`Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`}canHandleAuthentication(){return!1}handleAuthentication(){return K(this,void 0,void 0,function*(){throw new Error("not implemented")})}};_.BasicCredentialHandler=z;var $=class{constructor(e){this.token=e}prepareRequest(e){if(!e.headers)throw Error("The request has no headers");e.headers.Authorization=`Bearer ${this.token}`}canHandleAuthentication(){return!1}handleAuthentication(){return K(this,void 0,void 0,function*(){throw new Error("not implemented")})}};_.BearerCredentialHandler=$;var F=class{constructor(e){this.token=e}prepareRequest(e){if(!e.headers)throw Error("The request has no headers");e.headers.Authorization=`Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`}canHandleAuthentication(){return!1}handleAuthentication(){return K(this,void 0,void 0,function*(){throw new Error("not implemented")})}};_.PersonalAccessTokenCredentialHandler=F});var M=exports&&exports.__assign||function(){return M=Object.assign||function(r){for(var e,t=1,n=arguments.length;t<n;t++){e=arguments[t];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(r[i]=e[i])}return r},M.apply(this,arguments)},H=exports&&exports.__awaiter||function(r,e,t,n){function i(s){return s instanceof t?s:new t(function(a){a(s)})}return new(t||(t=Promise))(function(s,a){function c(u){try{o(n.next(u))}catch(h){a(h)}}function l(u){try{o(n.throw(u))}catch(h){a(h)}}function o(u){u.done?s(u.value):i(u.value).then(c,l)}o((n=n.apply(r,e||[])).next())})},X=exports&&exports.__generator||function(r,e){var t={label:0,sent:function(){if(s[0]&1)throw s[1];return s[1]},trys:[],ops:[]},n,i,s,a;return a={next:c(0),throw:c(1),return:c(2)},typeof Symbol=="function"&&(a[Symbol.iterator]=function(){return this}),a;function c(o){return function(u){return l([o,u])}}function l(o){if(n)throw new TypeError("Generator is already executing.");for(;t;)try{if(n=1,i&&(s=o[0]&2?i.return:o[0]?i.throw||((s=i.return)&&s.call(i),0):i.next)&&!(s=s.call(i,o[1])).done)return s;switch(i=0,s&&(o=[o[0]&2,s.value]),o[0]){case 0:case 1:s=o;break;case 4:return t.label++,{value:o[1],done:!1};case 5:t.label++,i=o[1],o=[0];continue;case 7:o=t.ops.pop(),t.trys.pop();continue;default:if(s=t.trys,!(s=s.length>0&&s[s.length-1])&&(o[0]===6||o[0]===2)){t=0;continue}if(o[0]===3&&(!s||o[1]>s[0]&&o[1]<s[3])){t.label=o[1];break}if(o[0]===6&&t.label<s[1]){t.label=s[1],s=o;break}if(s&&t.label<s[2]){t.label=s[2],t.ops.push(o);break}s[2]&&t.ops.pop(),t.trys.pop();continue}o=e.call(r,t)}catch(u){o=[6,u],i=0}finally{n=s=0}if(o[0]&5)throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}};exports.__esModule=!0;var Ee=require("http"),xe=require("url"),ke=require("child_process"),ce=ie(),Pe=oe();console.log("hello, world!");process.env.IS_BACKGROUND?Be():(console.log("spawning"),ae=(0,ke.spawn)(process.execPath,process.argv.slice(1),{detached:!0,stdio:"inherit",env:M(M({},process.env),{IS_BACKGROUND:"1"})}),ae.unref());var ae;function W(r){return r?200<=r&&r<300:!1}function Ue(r,e,t,n,i,s){var a;return H(this,void 0,void 0,function(){var c,l,o,u,h,f,v,m;return X(this,function(b){switch(b.label){case 0:return c="".concat(t,"-").concat(n),l="b",o={key:c,version:l,cacheSize:i},[4,r.postJson("".concat(e,"caches"),o)];case 1:return u=b.sent(),h=(a=u==null?void 0:u.result)===null||a===void 0?void 0:a.cacheId,h?[4,r.sendStream("PATCH","".concat(e,"caches/").concat(h),s,{"Content-Type":"application/octet-stream","Content-Range":"bytes 0-".concat(i-1,"/*")})]:[2,!1];case 2:return f=b.sent(),W(f.message.statusCode)?(v={size:i},[4,r.postJson("".concat(e,"caches/").concat(h),v)]):[2,!1];case 3:return m=b.sent(),W(m.statusCode)?[2,!0]:[2,!1]}})})}function Ne(r,e,t,n){var i;return H(this,void 0,void 0,function(){var s,a,c,l,o,u;return X(this,function(h){switch(h.label){case 0:return s="".concat(t,"-").concat(n),a="b",[4,r.getJson("".concat(e,"cache?key=").concat(s,"&version=").concat(a))];case 1:return c=h.sent(),l=(i=c==null?void 0:c.result)===null||i===void 0?void 0:i.archiveLocation,l?(o=new ce.HttpClient("bazel-github-actions-cache"),[4,o.get(l)]):[2,null];case 2:return u=h.sent(),W(u.message.statusCode)?[2,u.message]:(u.message.resume(),[2,null])}})})}function Be(){var r=this,e=Ee.createServer(),t=0,n=0,i=0,s=0,a=0,c=process.env.ACTIONS_CACHE_URL||"http://localhost:3056/",l="".concat(c,"_apis/artifactcache/"),o=process.env.ACTIONS_RUNTIME_TOKEN;console.log("baseUrl: ".concat(l));var u=new ce.HttpClient("bazel-github-actions-cache",[new Pe.BearerCredentialHandler(o)],{headers:{Accept:"application/json;api-version=6.0-preview.1"}});e.on("request",function(h,f){return H(r,void 0,void 0,function(){var v,m,b,D,L,C,ue,x,le;return X(this,function(y){switch(y.label){case 0:return v=(0,xe.parse)(h.url),v.pathname!="/close"?[3,1]:(e.close(),f.writeHead(200),f.end("Stats: ".concat(n," / ").concat(t," == ").concat(n*100/(t||1),"%, Upload: ").concat(s," / ").concat(i,", ").concat(a," bytes")),[3,15]);case 1:return v.pathname.startsWith("/_apis/artifactcache/")?(f.writeHead(404),f.end(),[3,15]):[3,2];case 2:if(!(v.pathname.startsWith("/cas/")||v.pathname.startsWith("/ac/")))return[3,14];if(m=v.pathname.startsWith("/cas/"),b=v.pathname.substring(m?5:4),D=m?"cas":"ac",h.method!="PUT")return[3,7];i+=1,L=Number(h.headers["content-length"]),C=void 0,y.label=3;case 3:return y.trys.push([3,5,,6]),[4,Ue(u,l,D,b,L,h)];case 4:return C=y.sent(),[3,6];case 5:return ue=y.sent(),[3,6];case 6:return C?(s+=1,a+=L,f.writeHead(200)):f.writeHead(500),f.end(),[3,13];case 7:if(h.method!="GET")return[3,12];t+=1,x=void 0,y.label=8;case 8:return y.trys.push([8,10,,11]),[4,Ne(u,l,D,b)];case 9:return x=y.sent(),[3,11];case 10:return le=y.sent(),[3,11];case 11:return x?(n+=1,f.writeHead(200,{"Content-Type":"application/octet-stream"}),x.pipe(f)):(f.writeHead(404),f.end()),[3,13];case 12:f.writeHead(400),f.end(),y.label=13;case 13:return[3,15];case 14:f.writeHead(404),f.end(),y.label=15;case 15:return[2]}})})}),e.on("close",function(){console.log("Goodbye: ".concat(n,", ").concat(t,", ").concat(i,", ").concat(s,", ").concat(a))}),e.listen(3055)}
