import { CRLF, HTTP_VERSION } from "../constants.js";

enum DefaultHeaders {
  ContentLength = "Content-Length",
  ContentType = "Content-Type",
  Connection = "Connection",
}

export class HTTPResponse {
  public headers: Record<string, string>;

  constructor() {
    this.headers = {};
  }

  public static readonly StatusCode = {
    CODE_200: 200,
    CODE_400: 400,
    CODE_500: 500,
  } as const;

  private statusCodeReasonMap: Record<number, string> = {
    [HTTPResponse.StatusCode.CODE_200]: "OK",
    [HTTPResponse.StatusCode.CODE_400]: "Bad Request",
    [HTTPResponse.StatusCode.CODE_500]: "Internal Server Error",
  };

  public writeStatusLine(code: number) {
    let statusLine = `HTTP/${HTTP_VERSION} ${code} `; //
    const correspondingPhrase = this.statusCodeReasonMap[code] ?? "";

    statusLine += correspondingPhrase + CRLF;
    return statusLine;
  }

  public getDefaultHeaders(contentLength: number) {
    // setting few default headers
    this.headers[DefaultHeaders.ContentLength] = contentLength.toString();
    this.headers[DefaultHeaders.ContentType] = "text/plain";
    this.headers[DefaultHeaders.Connection] = "close";
  }

  public writeHeaders() {
    const entries = Object.entries(this.headers);
    const mapped = entries.map(([k, v]) => `${k}: ${v}${CRLF}`);
    return mapped.join("") + CRLF;
  }
}
