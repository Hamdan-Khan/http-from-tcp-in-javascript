import { HTTPResponse } from "./src/response/response.js";
import { HTTPServer } from "./src/server/server.js";
import type { ParsedRequestInterface } from "./src/types.js";

async function main() {
  const server = new HTTPServer();
  function handler(request: ParsedRequestInterface): HTTPResponse {
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
