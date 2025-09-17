import { ASCII_RANGE, CRLF } from "./constants.js";
import { HTTPHeaders, type ParsedHeadersType } from "./headers/headers.js";
import {
  ParserState,
  type HTTPRequestInterface,
  type ParsedRequestInterface,
  type RequestLine,
} from "./types.js";

/**
 * Parse HTTP Requests using `.handleParsing()` method
 */
export class HTTPRequest implements HTTPRequestInterface {
  requestLine: RequestLine | null;
  state: ParserState;
  private headersManager: HTTPHeaders;

  constructor() {
    this.requestLine = null;
    this.state = ParserState.INITIALIZED;
    this.headersManager = new HTTPHeaders();
  }

  get headers() {
    return this.headersManager.headers;
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
      bytesParsed: newLineIndex + 2, // e.g. "abc\r\n" -> 3 (newLineIndex) + 2 (newline bytes)
    };
  }

  /**
   * stateful function which parses provided bytes based on the current state of the parser
   *
   * - `INITIALIZED` - tries to parse request-line
   * - `PARSING_HEADERS` - tries to parse headers (loops for multiple headers)
   * - `DONE` - request is parsed
   *
   * @param slice slice of message to be parsed
   * @returns  number of bytes parsed = `number` / incomplete data = `0` / error = `null`
   */
  private parse(slice: string | Buffer) {
    const stringified = slice.toString();
    let parsedBytes = 0;
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
      parsedBytes = parsed.bytesParsed;
    }
    if (this.state === ParserState.PARSING_HEADERS) {
      let parsed: ParsedHeadersType | null = null;
      while (!(parsed && !parsed.done && parsed.bytesParsed === 0)) {
        parsed = this.headersManager.parseHeaders(
          stringified.slice(parsedBytes),
        );

        // returns null in case of invalid key or some other failed condition
        if (parsed === null) {
          return null;
        }

        parsedBytes += parsed.bytesParsed;

        // has encountered the end of headers
        if (parsed.done) {
          this.state = ParserState.DONE;
          break;
        }
      }
    }
    return parsedBytes;
  }

  private bytesParsed = 0; // to flush parsed chunk of bytes from memory
  private internalBuffer = "";

  /**
   * stateful function to handle parsing of data received from a stream / socket
   *
   * @param chunk received from stream of data
   */
  public handleParsing(chunk: string) {
    // adds the newly arrived chunk to the buffer
    const updatedBuffer = this.internalBuffer + chunk;

    // removes the parsed bytes from the buffer (if any)
    // will only do so, if there was some succesful parsing in the previous call of this function
    this.internalBuffer = updatedBuffer.slice(this.bytesParsed);

    // parses the data present in the buffer
    const bytesParsed = this.parse(this.internalBuffer);

    if (bytesParsed != null) {
      // in non-error cases, its either:
      // 0 for insufficient data for parsing making sure the memory is not sliced in the next iteration
      // or a non-zero positive number (length of succesfully parsed chunk): to free the memory from that chunk
      this.bytesParsed = bytesParsed;
    }
  }

  get parsedRequest(): ParsedRequestInterface {
    return {
      requestLine: this.requestLine,
      headers: this.headers,
    };
  }
}
