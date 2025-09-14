## HTTP from TCP in javascript

low-level implementation of HTTP server from scratch

WIP!

### Flow of execution:

- `RequestFromReader(reader)` where `reader` can be a readable stream or socket
- The stream is listened for data `chunks`
- `HTTPRequest` instance handles the parsing of chunks through `handleParsing(chunk)` method.
- The `handleParsing` method
  - keeps incomplete stuff in memory using `internalBuffer` var.
  - uses `parse(slice)` to handle actual parsing logic. The state of parser (`done`, `initialized`, etc.) is also maintained in `parse(slice)`.
  - keeps track of the length of parsed bytes using `bytesParsed` var. This way it clears the parsed bytes from memory as soon as they're parsed.
