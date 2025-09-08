import type { Socket } from "net";
import { Readable } from "stream";
import { HTTPRequest } from "./classes.js";
import { ParserState, type RequestLine } from "./types.js";
import { ChunkReader } from "./utils.js";

/**
 * To form a parsed request object from a readable source
 *
 * @param reader source to read data from: readable stream
 * @returns resolvable Parsed request line / null if an error is occured
 */
export function RequestFromReader(
  reader: Readable | ChunkReader | Socket,
): Promise<RequestLine | null> {
  return new Promise((resolve) => {
    const httpRequest = new HTTPRequest();

    if (reader instanceof ChunkReader) {
      let buffer = "";
      let chunk = reader.read();
      let bytesParsed = 0; // to flush parsed chunk of bytes from memory

      // chunkReader returns 0 when all the data is read
      // parser state becomes DONE when the request-line is succesfully parsed
      while (chunk !== 0 && httpRequest.state !== ParserState.DONE) {
        const updatedBuffer = buffer + chunk;
        buffer = updatedBuffer.slice(bytesParsed);
        const receivedBytes = httpRequest.parse(buffer);
        if (receivedBytes != null) {
          bytesParsed = receivedBytes;
        }
        chunk = reader.read();
      }
      resolve(httpRequest.requestLine);
    } else {
      reader.on("data", (chunk) => {
        httpRequest.parse(chunk);
      });

      reader.on("end", () => {
        resolve(httpRequest.requestLine);
      });

      reader.on("error", () => {
        resolve(null);
      });
    }
  });
}
