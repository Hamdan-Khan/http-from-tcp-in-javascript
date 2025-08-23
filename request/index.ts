import { Readable } from "stream";
import { RequestFromReader } from "./src/request.js";

async function main() {
  const stream = Readable.from(
    "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
  );

  const startline = await RequestFromReader(stream);
  console.log(startline);
}

main();
