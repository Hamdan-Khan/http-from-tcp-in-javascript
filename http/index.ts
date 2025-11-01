import http from "http";
import type { Socket } from "net";
import { CRLF } from "./src/constants.js";
import { HTTPResponse } from "./src/response/response.js";
import { HTTPServer } from "./src/server/server.js";
import type { ParsedRequestInterface } from "./src/types.js";

async function main() {
  const server = new HTTPServer();
  function handler(
    socket: Socket, // to be used in streaming responses only
    request: ParsedRequestInterface,
  ): HTTPResponse | 0 {
    // proxy handler for chunked streaming
    if (
      request.requestLine?.requestTarget.startsWith("/httpbin") &&
      request.requestLine?.requestTarget.split("/")[1] === "httpbin"
    ) {
      const res = new HTTPResponse();
      res.writeHeaders({ "Transfer-Encoding": "chunked" });
      res.writeStatusLine(200);
      const firstChunk = res.formattedResponse;
      socket.write(firstChunk);

      const options = {
        hostname: `httpbin.org`,
        port: 80,
        path: `/stream/${
          request.requestLine?.requestTarget.split("/")[2] ?? 1
        }`,
        method: "GET",
      };

      const proxy = http.request(options, (response) => {
        response.on("data", (chunk) => {
          res.writeChunkedBody(socket, chunk);
        });

        response.on("end", () => {
          socket.write("0" + CRLF + CRLF);
          socket.end();
        });
      });

      proxy.on("error", (err) => {
        console.log(err);
      });

      proxy.end();

      return 0; // to distinguish between normal and chunked responses
    }
    if (request.requestLine?.requestTarget === "/yourproblem") {
      const res = new HTTPResponse();
      res.writeHeaders({ testHeader: "123", "Content-Type": "text/html" });
      res.writeStatusLine(400);
      res.writeBody(`<html>
  <head>
    <title>400 Bad Request</title>
  </head>
  <body>
    <h1>Bad Request</h1>
    <p>Your request honestly kinda sucked.</p>
  </body>
</html>`);
      return res;
    }
    if (request.requestLine?.requestTarget === "/myproblem") {
      const res = new HTTPResponse();
      res.writeHeaders({ testHeader: "123", "Content-Type": "text/html" });
      res.writeStatusLine(500);
      res.writeBody(`<html>
  <head>
    <title>500 Internal Server Error</title>
  </head>
  <body>
    <h1>Internal Server Error</h1>
    <p>Okay, you know what? This one is on me.</p>
  </body>
</html>`);
      return res;
    }

    const res = new HTTPResponse();
    res.writeHeaders({ testHeader: "123", "Content-Type": "text/html" });
    res.writeStatusLine(200);
    res.writeBody(`<html>
  <head>
    <title>200 OK</title>
  </head>
  <body>
    <h1>Success!</h1>
    <p>Just received a request for ${request.requestLine?.requestTarget}. Are you still using HTTP/${request.requestLine?.httpVersion}? Its over for you</p>
  </body>
</html>`);
    return res;
  }

  server.serve(handler);

  server.listen(3000, () => {
    console.log("Server listening at port ", 3000);
  });
}

main();

export * from "./src/request/request.js";
