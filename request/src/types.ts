export enum ParserState {
  INITIALIZED = "initialized",
  DONE = "done",
}

export interface HTTPRequestInterface {
  requestLine: RequestLine | null;
  state: ParserState;
}

export interface RequestLine {
  httpVersion: string;
  requestTarget: string;
  method: string;
}
