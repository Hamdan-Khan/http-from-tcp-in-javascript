import { HTTPServer } from "./src/server/server.js";

async function main() {
  const server = new HTTPServer();
  server.serve();

  server.listen(3000, () => {
    console.log("Server listening at port ", 3000);
  });
}

main();

export * from "./src/request.js";

// todo: refactor request package:
// switch request <-> httpServer
