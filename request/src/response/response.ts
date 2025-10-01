import { CRLF, HTTP_VERSION } from "../constants.js";

enum DefaultHeaders {
  ContentLength = "Content-Length",
  ContentType = "Content-Type",
  Connection = "Connection",
}

export class HTTPResponse {
  private localHeaders: Record<string, string> = {};
  private headers: string = "";
  private body: string = "";
  private statusLine: string = "";

  constructor() {
    this.localHeaders = this.getDefaultHeaders();
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
    let localStatusLine = `HTTP/${HTTP_VERSION} ${code} `;
    const correspondingPhrase = this.statusCodeReasonMap[code] ?? "";
    localStatusLine += correspondingPhrase + CRLF;
    this.statusLine = localStatusLine;
  }

  /**
   * sets few default headers
   */
  private getDefaultHeaders() {
    return {
      [DefaultHeaders.ContentType]: "text/plain",
      [DefaultHeaders.Connection]: "close",
    };
  }

  /**
   * adds header to the response message.
   * calling this function more than once with new headers will append the new headers
   */
  public writeHeaders(headers?: Record<string, string>) {
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => {
        this.localHeaders[k] = v;
      });
    }
    const entries = Object.entries(this.localHeaders);
    const mapped = entries.map(([k, v]) => `${k}: ${v}${CRLF}`);
    this.headers = mapped.join("") + CRLF;
  }

  public writeBody(body: string) {
    this.body = body;
    // write the content-length header right after adding the body
    const contentLengthHeader = {
      [DefaultHeaders.ContentLength]: body.length.toString(),
    };
    this.writeHeaders(contentLengthHeader);
  }

  public get formattedResponse(): string {
    return this.statusLine + this.headers + this.body;
  }
}
