import { HTTPHeaders } from "./headers.js";

describe("Headers parser", () => {
  test("Valid single header", () => {
    const headers = new HTTPHeaders();
    const data = "Host: localhost:42069\r\n\r\n";
    const result = headers.parseHeaders(data);

    expect(result).toEqual({ done: false, bytesParsed: 23 });
    expect(headers.headers).toEqual({ host: "localhost:42069" });
  });

  test("Valid single header with extra whitespace", () => {
    const headers = new HTTPHeaders();
    const data = "   Host:   localhost   \r\n\r\n";
    const result = headers.parseHeaders(data);

    expect(result).toEqual({ done: false, bytesParsed: 25 });
    expect(headers.headers).toEqual({ host: "localhost" });
  });

  test("Valid 2 headers with existing headers", () => {
    const headers = new HTTPHeaders();
    const first = headers.parseHeaders("Host: localhost\r\n");
    expect(first).toEqual({ done: false, bytesParsed: 17 });
    expect(headers.headers).toEqual({ host: "localhost" });

    const second = headers.parseHeaders("User-Agent: jest\r\n\r\n");
    expect(second).toEqual({ done: false, bytesParsed: 18 });
    expect(headers.headers).toEqual({
      host: "localhost",
      "user-agent": "jest",
    });
  });

  test("Valid done", () => {
    const headers = new HTTPHeaders();
    const result = headers.parseHeaders("\r\n");

    expect(result).toEqual({ done: true, bytesParsed: 0 });
    expect(headers.headers).toBeUndefined();
  });

  test("Invalid spacing header", () => {
    const headers = new HTTPHeaders();
    const result = headers.parseHeaders("Host : localhost\r\n\r\n");

    expect(result).toEqual(null);
    expect(headers.headers).toBeUndefined();
  });
});
