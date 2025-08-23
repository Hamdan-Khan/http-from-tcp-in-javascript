const { Readable } = require("stream");
const { RequestFromReader } = require("./request");

test("Good requeest line", () => {
  const r = RequestFromReader(
    Readable.from(
      "GET / HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n",
    ),
  );

  if (r) {
    expect(r).toHaveProperty("method");
    expect(r).toHaveProperty("requestTarget");
    expect(r).toHaveProperty("httpVersion");
    expect(r.method).toBe("GET");
    expect(r.requestTarget).toBe("/");
    expect(r.httpVersion).toBe("1.1");
  }
});
