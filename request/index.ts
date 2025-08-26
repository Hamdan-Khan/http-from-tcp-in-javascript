import { ChunkReader } from "src/utils.js";
import { RequestFromReader } from "./src/request.js";

async function main() {
  const chunkReader = new ChunkReader(
    "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
    8,
  );

  const startline = await RequestFromReader(chunkReader);
  console.log(startline);
}

main();
