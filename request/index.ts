import { HTTPServer } from "./src/server/server.js";
import type { ParsedRequestInterface } from "./src/types.js";

async function main() {
  const server = new HTTPServer();
  function handler(request: ParsedRequestInterface) {
    if (request.requestLine?.requestTarget === "/yourproblem") {
      return {
        message: "Your problem is not my problem\n",
        statusCode: 400,
      };
    }
    if (request.requestLine?.requestTarget === "/myproblem") {
      return {
        message: "Ooops, my bad\n",
        statusCode: 500,
      };
    }
    return `Just received a request for ${request.requestLine?.requestTarget}. Are you still using HTTP/${request.requestLine?.httpVersion}? Its over for you`;
  }

  server.serve(handler);

  server.listen(3000, () => {
    console.log("Server listening at port ", 3000);
  });
}

main();

export * from "./src/request.js";

// todo: refactor request package:
// switch request <-> httpServer
