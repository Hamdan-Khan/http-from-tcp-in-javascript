import { Readable } from "stream";
import { HTTPRequest } from "./classes";
import { ASCII_RANGE, CRLF } from "./constants";
import { ParserState, RequestLine } from "./types";
import { ChunkReader } from "./utils";

/**
 * Parses request-line (start-line) from a HTTP-message
 *
 * Returns null (for now) if there's an error
 *
 * @param message HTTP message in form of string
 * @returns `RequestLine | null`
 */
export function parseRequestLine(
  message: string,
): null | { requestLine: RequestLine; bytesParsed: number } | 0 {
  const newLineIndex = message.search(CRLF);

  // no newline found
  if (newLineIndex === -1) {
    return 0;
  }

  // possible start-line
  const candidate = message.substring(0, newLineIndex);
  // request line parts (method, target, http-ver) separated by spaces
  const parts = candidate.split(" ");

  // must be 3 parts
  if (parts.length !== 3) {
    console.error("parseRequestLine: invalid start-line (must be 3 parts)");
    return null;
  }

  // must be non empty parts (.split also considers empty strings)
  for (const part of parts) {
    if (part === "") {
      console.error(
        "parseRequestLine: invalid start-line (missing / empty parts)",
      );
      return null;
    }
  }

  const method = parts[0];
  const requestTarget = parts[1];
  const httpVersion = parts[2].replace("HTTP/", "");

  // to validate the request line parts
  // method should be upper-case
  for (let i = 0; i < method.length; i++) {
    if (
      method.charCodeAt(i) < ASCII_RANGE.capitalStart ||
      method.charCodeAt(i) > ASCII_RANGE.capitalEnd
    ) {
      console.error("parseRequestLine: invalid start-line (invalid method)");
      return null;
    }
  }
  // http version is in format: [major.minor]
  const versions = httpVersion.split(".");
  const isValidVersion =
    versions.length === 2 && versions.every((v) => !isNaN(Number(v)));
  if (!isValidVersion) {
    console.error(
      "parseRequestLine: invalid start-line (invalid http version)",
    );
    return null;
  }

  return {
    requestLine: {
      method,
      requestTarget,
      httpVersion,
    },
    bytesParsed: newLineIndex,
  };
}

/**
 * To form a parsed request object from a readable source
 *
 * @param reader source to read data from: readable stream
 * @returns resolvable Parsed request line / null if an error is occured
 */
export function RequestFromReader(
  reader: Readable | ChunkReader,
): Promise<RequestLine | null> {
  return new Promise((resolve) => {
    const httpRequest = new HTTPRequest();

    if (reader instanceof ChunkReader) {
      let buffer = "";
      let chunk = reader.read();

      // chunkReader returns 0 when all the data is read
      // parser state becomes DONE when the request-line is succesfully parsed
      while (chunk !== 0 && httpRequest.state !== ParserState.DONE) {
        buffer = buffer + chunk;
        httpRequest.parse(buffer as string);
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
