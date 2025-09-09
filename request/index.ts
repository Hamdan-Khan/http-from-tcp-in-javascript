import { RequestFromReader } from "./src/request.js";
import { ChunkReader } from "./src/utils.js";

async function main() {
  const chunkReader = new ChunkReader(
    "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
    8,
  );
  const request = await RequestFromReader(chunkReader);
  console.log(request);
}

main();

export * from "./src/request.js";
