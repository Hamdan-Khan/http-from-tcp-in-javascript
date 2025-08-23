const { Readable } = require("stream");
import { RequestFromReader } from "./request";

describe("Request Line Parser Tests", () => {
  test("Good request line", async () => {
    const r = await RequestFromReader(
      Readable.from(
        "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
      ),
    );

    expect(r).not.toBeNull();
    expect(r).toHaveProperty("method");
    expect(r).toHaveProperty("requestTarget");
    expect(r).toHaveProperty("httpVersion");
    expect(r.method).toBe("GET");
    expect(r.requestTarget).toBe("/");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Good Request line with path", async () => {
    const r = await RequestFromReader(
      Readable.from("GET /users/123 HTTP/1.1\r\nHost: localhost:8080\r\n\r\n"),
    );

    expect(r).not.toBeNull();
    expect(r.method).toBe("GET");
    expect(r.requestTarget).toBe("/users/123");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Good Request line with complex path", async () => {
    const r = await RequestFromReader(
      Readable.from(
        "GET /api/v1/users?id=123&name=john HTTP/1.1\r\nHost: example.com\r\n\r\n",
      ),
    );

    expect(r).not.toBeNull();
    expect(r.method).toBe("GET");
    expect(r.requestTarget).toBe("/api/v1/users?id=123&name=john");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Good POST Request with path", async () => {
    const r = await RequestFromReader(
      Readable.from(
        "POST /api/users HTTP/1.1\r\nHost: localhost:3000\r\nContent-Type: application/json\r\n\r\n",
      ),
    );

    expect(r).not.toBeNull();
    expect(r.method).toBe("POST");
    expect(r.requestTarget).toBe("/api/users");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Good PUT Request with path", async () => {
    const r = await RequestFromReader(
      Readable.from("PUT /users/456 HTTP/1.1\r\nHost: api.example.com\r\n\r\n"),
    );

    expect(r).not.toBeNull();
    expect(r.method).toBe("PUT");
    expect(r.requestTarget).toBe("/users/456");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Good DELETE Request with path", async () => {
    const r = await RequestFromReader(
      Readable.from(
        "DELETE /posts/789 HTTP/1.1\r\nHost: blog.example.com\r\n\r\n",
      ),
    );

    expect(r).not.toBeNull();
    expect(r.method).toBe("DELETE");
    expect(r.requestTarget).toBe("/posts/789");
    expect(r.httpVersion).toBe("1.1");
  });

  test("Invalid number of parts in request line - too few", async () => {
    const r = await RequestFromReader(
      Readable.from("GET HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid number of parts in request line - too many", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTP/1.1 extra\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid number of parts in request line - only one part", async () => {
    const r = await RequestFromReader(
      Readable.from("GET\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid method (lowercase) Request line", async () => {
    const r = await RequestFromReader(
      Readable.from("get / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid method (mixed case) Request line", async () => {
    const r = await RequestFromReader(
      Readable.from("Get / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid method (with numbers) Request line", async () => {
    const r = await RequestFromReader(
      Readable.from("GET1 / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid method (with special characters) Request line", async () => {
    const r = await RequestFromReader(
      Readable.from("GET- / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid version in Request line - HTTP/1.0", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTP/1.0\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid version in Request line - HTTP/2.0", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTP/2.0\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid version in Request line - malformed version", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTP/1.1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Invalid version in Request line - completely wrong protocol", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTPS/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  // Edge cases
  test("Empty request line", async () => {
    const r = await RequestFromReader(
      Readable.from("\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("No CRLF in message", async () => {
    const r = await RequestFromReader(Readable.from("GET / HTTP/1.1"));

    expect(r).toBeNull();
  });

  test("Request line with only spaces", async () => {
    const r = await RequestFromReader(
      Readable.from("   \r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Request line with extra spaces between parts", async () => {
    const r = await RequestFromReader(
      Readable.from("GET  /  HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Request line with tabs instead of spaces", async () => {
    const r = await RequestFromReader(
      Readable.from("GET\t/\tHTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Request line with leading spaces", async () => {
    const r = await RequestFromReader(
      Readable.from(" GET / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Request line with trailing spaces", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / HTTP/1.1 \r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Empty method", async () => {
    const r = await RequestFromReader(
      Readable.from(" / HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Empty request target", async () => {
    const r = await RequestFromReader(
      Readable.from("GET  HTTP/1.1\r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });

  test("Empty HTTP version", async () => {
    const r = await RequestFromReader(
      Readable.from("GET / \r\nHost: localhost\r\n\r\n"),
    );

    expect(r).toBeNull();
  });
});
