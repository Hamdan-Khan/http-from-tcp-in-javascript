export interface HTTPRequest {
  requestLine: RequestLine;
}

export interface RequestLine {
  httpVersion: string;
  requestTarget: string;
  method: string;
}
