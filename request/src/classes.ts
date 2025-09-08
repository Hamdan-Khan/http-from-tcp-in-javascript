import { ASCII_RANGE, CRLF } from "./constants.js";
import { HTTPHeaders } from "./headers/headers.js";
import {
  ParserState,
  type HTTPRequestInterface,
  type RequestLine,
} from "./types.js";

/**
 * Parse HTTP Requests using `.parse()` method
 */
export class HTTPRequest implements HTTPRequestInterface {
  requestLine: RequestLine | null;
  state: ParserState;
  private headersManager: HTTPHeaders;
  headers: typeof this.headersManager.headers;

  constructor() {
    this.requestLine = null;
    this.state = ParserState.INITIALIZED;
    this.headersManager = new HTTPHeaders();
  }

  /**
   * Parses request-line (start-line) from a HTTP-message
   *
   * Returns null (for now) if there's an error
   *
   * @param message HTTP message in form of string
   * @returns `RequestLine | null`
   */
  private parseRequestLine(
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
    const httpVersion = parts[2]?.replace("HTTP/", "");

    // to validate the request line parts
    // method should be upper-case
    if (!method) {
      console.error("parseRequestLine: invalid start-line (invalid method)");
      return null;
    }
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
    if (!httpVersion) {
      console.error(
        "parseRequestLine: invalid start-line (invalid http version)",
      );
      return null;
    }
    const versions = httpVersion.split(".");
    const isValidVersion =
      versions.length === 2 && versions.every((v) => !isNaN(Number(v)));
    if (!isValidVersion) {
      console.error(
        "parseRequestLine: invalid start-line (invalid http version)",
      );
      return null;
    }

    // validate request target
    if (!requestTarget) {
      console.error(
        "parseRequestLine: invalid start-line (invalid request target)",
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
   *
   * @param slice slice of message to be parsed
   * @returns  number of bytes parsed = `number` / incomplete data = `0` / error = `null`
   */
  public parse(slice: string | Buffer) {
    const stringified = slice.toString();
    if (this.state === ParserState.DONE) {
      console.error("parse error: trying to read data in a done state");
      return null;
    }
    if (this.state === ParserState.INITIALIZED) {
      const parsed = this.parseRequestLine(stringified);
      // error case
      if (parsed === null) {
        return null;
      }

      // incomplete request line case (no CRLF encountered)
      if (parsed === 0) {
        return 0;
      }
      this.requestLine = parsed.requestLine;
      this.state = ParserState.PARSING_HEADERS;
      return parsed.bytesParsed;
    }
    if (this.state === ParserState.PARSING_HEADERS) {
      const parsed = this.headersManager.parseHeaders(stringified);
      // returns null in case of invalid key
      if (parsed === null) {
        return null;
      }

      // has not encountered the end of headers yet
      if (!parsed.done) {
        return parsed.bytesParsed;
      }

      this.headers = this.headersManager.headers;
      this.state = ParserState.DONE;
      return parsed.bytesParsed;
    }
  }
}
