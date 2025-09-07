import { Headers } from "./src/headers/headers.js";
import { ChunkReader } from "./src/utils.js";

async function main() {
  const chunkReader = new ChunkReader(
    "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
    8,
  );
  // const startline = await RequestFromReader(chunkReader);

  const testHeader = "Host: localhost:42069\r\n\r\n";
  const headers = new Headers();
  console.log(headers.parseHeaders(testHeader));
}

main();

export * from "./src/request.js";
