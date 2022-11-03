"use strict";
exports.__esModule = true;
var http = require("http");
http.get("http://localhost:3055/close", {}, (response) => {
    let b = Buffer.alloc(0);
    response.on('data', (chunk) => {
        b = Buffer.concat([b, chunk])
    });
    response.on('end', () => {
        console.log(b.toString());
    })
});
