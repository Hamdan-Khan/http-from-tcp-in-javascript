import type { Socket } from "net";
import { Readable } from "stream";
import { type ParsedRequestInterface } from "../types.js";
import { ChunkReader } from "../utils/chunkReader.js";
import { HTTPRequest } from "./request.class.js";

/**
 * To form a parsed request object from a readable source
 *
 * @param reader source to read data from: readable stream
 * @returns resolvable Parsed request line / null if an error is occured
 */
export function RequestFromReader(
  reader: Readable | ChunkReader | Socket,
): Promise<ParsedRequestInterface | null> {
  return new Promise((resolve) => {
    const httpRequest = new HTTPRequest();

    if (reader instanceof ChunkReader) {
      let chunk = reader.read();

      // chunkReader returns 0 when all the data is read
      while (chunk !== 0) {
        httpRequest.handleParsing(chunk);
        chunk = reader.read();
      }
      resolve(httpRequest.parsedRequest);
    } else {
      reader.on("data", (chunk) => {
        httpRequest.handleParsing(chunk);
        resolve(httpRequest.parsedRequest);
      });

      reader.on("error", () => {
        resolve(null);
      });
    }
  });
}
