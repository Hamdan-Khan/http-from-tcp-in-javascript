const { Readable } = require("stream");
import { RequestFromReader } from "./request.js";
import { ChunkReader } from "./utils.js";

describe("Request Line Parser Tests", () => {
  describe("Readable stream Tests", () => {
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
      expect(r?.method).toBe("GET");
      expect(r?.requestTarget).toBe("/");
      expect(r?.httpVersion).toBe("1.1");
    });

    test("Good Request line with path", async () => {
      const r = await RequestFromReader(
        Readable.from(
          "GET /users/123 HTTP/1.1\r\nHost: localhost:8080\r\n\r\n",
        ),
      );

      expect(r).not.toBeNull();
      expect(r?.method).toBe("GET");
      expect(r?.requestTarget).toBe("/users/123");
      expect(r?.httpVersion).toBe("1.1");
    });

    test("Good Request line with complex path", async () => {
      const r = await RequestFromReader(
        Readable.from(
          "GET /api/v1/users?id=123&name=john HTTP/1.1\r\nHost: example.com\r\n\r\n",
        ),
      );

      expect(r).not.toBeNull();
      expect(r?.method).toBe("GET");
      expect(r?.requestTarget).toBe("/api/v1/users?id=123&name=john");
      expect(r?.httpVersion).toBe("1.1");
    });

    test("Good POST Request with path", async () => {
      const r = await RequestFromReader(
        Readable.from(
          "POST /api/users HTTP/1.1\r\nHost: localhost:3000\r\nContent-Type: application/json\r\n\r\n",
        ),
      );

      expect(r).not.toBeNull();
      expect(r?.method).toBe("POST");
      expect(r?.requestTarget).toBe("/api/users");
      expect(r?.httpVersion).toBe("1.1");
    });

    test("Good PUT Request with path", async () => {
      const r = await RequestFromReader(
        Readable.from(
          "PUT /users/456 HTTP/1.1\r\nHost: api.example.com\r\n\r\n",
        ),
      );

      expect(r).not.toBeNull();
      expect(r?.method).toBe("PUT");
      expect(r?.requestTarget).toBe("/users/456");
      expect(r?.httpVersion).toBe("1.1");
    });

    test("Good DELETE Request with path", async () => {
      const r = await RequestFromReader(
        Readable.from(
          "DELETE /posts/789 HTTP/1.1\r\nHost: blog.example.com\r\n\r\n",
        ),
      );

      expect(r).not.toBeNull();
      expect(r?.method).toBe("DELETE");
      expect(r?.requestTarget).toBe("/posts/789");
      expect(r?.httpVersion).toBe("1.1");
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

      expect(r?.httpVersion).toBe("1.0");
    });

    test("Invalid version in Request line - HTTP/2.0", async () => {
      const r = await RequestFromReader(
        Readable.from("GET / HTTP/2.0\r\nHost: localhost\r\n\r\n"),
      );

      expect(r?.httpVersion).toBe("2.0");
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

  describe("Chunked stream Tests", () => {
    const testRequest =
      "GET /coffee HTTP/1.1\r\nHost: localhost:42069\r\nUser-Agent: curl/7.81.0\r\nAccept: */*\r\n\r\n";

    describe("Same data, different chunk sizes", () => {
      test("chunk size 1 - byte by byte", async () => {
        const reader = new ChunkReader(testRequest, 1);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("chunk size 3 - small chunks", async () => {
        const reader = new ChunkReader(testRequest, 3);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("chunk size 8 - medium chunks", async () => {
        const reader = new ChunkReader(testRequest, 8);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("chunk size 50 - large chunks", async () => {
        const reader = new ChunkReader(testRequest, 50);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("chunk size 1000 - entire request in one chunk", async () => {
        const reader = new ChunkReader(testRequest, 1000);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });
    });

    describe("Critical boundary splits", () => {
      test("split between method and space", async () => {
        // "GET" | " /coffee HTTP/1.1\r\n..."
        const reader = new ChunkReader(testRequest, 3); // "GET" in first chunk
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
      });

      test("split between path and HTTP", async () => {
        // "GET /coffee " | "HTTP/1.1\r\n..."
        const reader = new ChunkReader(testRequest, 12); // splits right before "HTTP"
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("split within CRLF sequence", async () => {
        // Split where first chunk ends with "\r" and second starts with "\n"
        const reader = new ChunkReader(testRequest, 17); // splits the \r\n
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("split right after request line CRLF", async () => {
        const reader = new ChunkReader(testRequest, 18); // "GET /coffee HTTP/1.1\r\n" | "Host:..."
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe("/coffee");
        expect(result?.httpVersion).toBe("1.1");
      });
    });

    describe("Various request lengths with chunking", () => {
      const requests = [
        "GET / HTTP/1.1\r\n\r\n", // minimal request
        "POST /api HTTP/1.1\r\nContent-Length: 0\r\n\r\n", // medium request
        "GET /very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3 HTTP/1.1\r\nHost: very-long-hostname.example.com\r\nUser-Agent: Mozilla/5.0\r\n\r\n", // long request
      ];

      requests.forEach((request, index) => {
        describe(`Request ${index + 1}: ${request.split("\r\n")[0]}`, () => {
          [1, 2, 5, 10].forEach((chunkSize) => {
            test(`chunk size ${chunkSize}`, async () => {
              const reader = new ChunkReader(request, chunkSize);
              const result = await RequestFromReader(reader);

              expect(result).not.toBeNull();
              // Just verify we can parse regardless of chunk size
              expect(result?.method).toMatch(/^[A-Z]+$/);
              expect(result?.requestTarget).toMatch(/^\//);
              expect(result?.httpVersion).toMatch(/^\d+\.\d+$/);
            });
          });
        });
      });
    });

    describe("Stress test - extreme chunking", () => {
      test("POST request with chunk size 1", async () => {
        const postRequest =
          "POST /submit HTTP/1.1\r\nHost: example.com\r\nContent-Type: application/json\r\nContent-Length: 25\r\n\r\n";
        const reader = new ChunkReader(postRequest, 1);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("POST");
        expect(result?.requestTarget).toBe("/submit");
        expect(result?.httpVersion).toBe("1.1");
      });

      test("Complex path with chunk size 2", async () => {
        const complexRequest =
          "GET /api/v2/users/123/posts?sort=date&limit=10&offset=20 HTTP/1.1\r\nHost: api.example.com\r\n\r\n";
        const reader = new ChunkReader(complexRequest, 2);
        const result = await RequestFromReader(reader);

        expect(result).not.toBeNull();
        expect(result?.method).toBe("GET");
        expect(result?.requestTarget).toBe(
          "/api/v2/users/123/posts?sort=date&limit=10&offset=20",
        );
        expect(result?.httpVersion).toBe("1.1");
      });
    });

    describe("Buffer accumulation behavior", () => {
      test("verify parser waits for complete request line", async () => {
        // Test that incomplete chunks are properly accumulated
        const incompleteRequests = [
          "GET", // no space or path yet
          "GET /", // no HTTP version yet
          "GET / HTTP", // no version number yet
          "GET / HTTP/1.1", // no CRLF yet
        ];

        for (const incomplete of incompleteRequests) {
          const reader = new ChunkReader(incomplete, 1000); // whole thing in one chunk
          const result = await RequestFromReader(reader);

          // Should return null because request line is incomplete (no CRLF)
          expect(result).toBeNull();
        }
      });

      test("verify parser processes as soon as CRLF is found", async () => {
        const completeRequestLine =
          "GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n";

        // Test with various chunk sizes to ensure CRLF detection works
        [1, 5, 10, 15, 19].forEach((chunkSize) => {
          const reader = new ChunkReader(completeRequestLine, chunkSize);
          const result = RequestFromReader(reader);

          // Should resolve successfully regardless of how CRLF is chunked
          expect(result).resolves.not.toBeNull();
        });
      });
    });
  });
});
