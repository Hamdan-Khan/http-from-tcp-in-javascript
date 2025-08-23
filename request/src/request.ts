import { Readable } from "stream";

interface HTTPRequest {
  requestLine: RequestLine;
}

interface RequestLine {
  httpVersion: string;
  requestTarget: string;
  method: string;
}

/**
 * New line
 */
const CRLF = "\r\n" as const;

/**
 * ASCII code ranges for capital and lower case letters
 */
const ASCII_RANGE = {
  capitalStart: 65,
  capitalEnd: 90,
  lowerStart: 97,
  lowerEnd: 122,
} as const;

/**
 * HTTP version
 */
const HTTP_VERSION = "1.1" as const;

function parseRequestLine(message: string): null | RequestLine {
  const newLineIndex = message.search(CRLF);

  // no newline found
  if (newLineIndex === -1) {
    return null;
  }

  // possible start-line
  const candidate = message.substring(0, newLineIndex);
  // request line parts (method, target, http-ver) separated by spaces
  const parts = candidate.split(" ");

  // must be 3 parts
  if (parts.length !== 3) {
    return null;
  }

  // must be non empty parts (.split also considers empty strings)
  for (const part of parts) {
    if (part === "") {
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
      return null;
    }
  }
  // http version should be 1.1
  if (httpVersion !== HTTP_VERSION) {
    return null;
  }

  return {
    method,
    requestTarget,
    httpVersion,
  };
}

export function RequestFromReader(
  stream: Readable,
): Promise<RequestLine | null> {
  return new Promise((resolve) => {
    let requestLine: RequestLine | null = null;

    stream.on("data", (chunk) => {
      requestLine = parseRequestLine(chunk.toString());
    });

    stream.on("end", () => {
      resolve(requestLine);
    });

    stream.on("error", () => {
      resolve(null);
    });
  });
}
