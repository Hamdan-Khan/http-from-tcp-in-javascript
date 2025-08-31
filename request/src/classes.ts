import { parseRequestLine } from "./request.js";
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

  constructor() {
    this.requestLine = null;
    this.state = ParserState.INITIALIZED;
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
      const parsed = parseRequestLine(stringified);
      // error case
      if (parsed === null) {
        return null;
      }

      // incomplete request line case (no CRLF encountered)
      if (parsed === 0) {
        return 0;
      }
      this.requestLine = parsed.requestLine;
      this.state = ParserState.DONE;
      return parsed.bytesParsed;
    }
  }
}
