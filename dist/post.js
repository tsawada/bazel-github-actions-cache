"use strict";
exports.__esModule = true;
var http = require("http");
http.get("http://localhost:3055/close", {}, (response) => {
    var s = '';
    response.on('data', (chunk) => {
        s += chunk;
    });
    response.on('end', () => {
        console.log(s);
    })
});
