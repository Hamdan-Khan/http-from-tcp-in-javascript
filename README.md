# HTTP from TCP in javascript

A low-level implementation of HTTP server from scratch in node js using `net` for TCP sockets.

It is a functional HTTP/1.1 server including: HTTP request parser, response formatter, some standard headers / response codes etc.
Though it might lack some niche standard stuff, but it works :)

## Basic working

Base class is `HTTPServer`. Response can be created using `HTTPResponse` class.

You can decide what to do with the incoming requests in the `handler` function. It should return instance of `HTTPRespone`, which is then written to the connected socket.

```js
const server = new HTTPServer();

function handle(socket, request) {
  // handle request / define routes / create proxy / etc.
}

server.serve(handler);

server.listen(3000, () => {
  console.log("Server listening at port ", 3000);
});
```

Check [this file](/http/index.ts) for a more detailed implementation.

To use the server package outside of the `http` directory, make sure to run `pnpm build`

## Chunked Streaming

A cute little implementation of a chunked streaming proxy for large responses can also be found in [this file](/http/index.ts).

Pretty much: setting the `Transfer-encoding` header to `chunked` and using the `writeChunkedBody()` method of response class enables sending chunked data.

You can hit the `/httpbin/[n]` endpoint to stream `n` amount of chunks from httpbin.org

## might add later

- load balancing stuff
- trailers (hashing, content-length, etc.) in chunked encoding
- handling binary data (images, vids, etc.)
