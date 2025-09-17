export enum ParserState {
  INITIALIZED = "initialized",
  PARSING_HEADERS = "parsingHeaders",
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

export interface ParsedRequestInterface {
  requestLine: RequestLine | null;
  headers: Record<string, string> | undefined;
}
