import { Readable } from "stream";

interface HTTPRequest {
  requestLine: RequestLine;
}

interface RequestLine {
  httpVersion: string;
  requestTarget: string;
  method: string;
}

export function RequestFromReader(stream: Readable) {
  stream.on("data", (chunk) => {
    console.log(chunk);
  });
}
