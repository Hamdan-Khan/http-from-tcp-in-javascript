# Notes

## HTTP-Message

The format of an HTTP request / response

```
start-line CRLF
*( field-line CRLF)
CRLF
[ message-body ]
```

## HTTP/1.1 Semantics (RFC 9110)

I'll probably forget all of this

- Resource : target of an HTTP request (identified by URI)

- URI : Uniform Resource Identifier, superset of URL and URN

- URL : Uniform Resource Locator, points to the resource's location e.g. https://google.com/

- URN : Uniform Resource Name, to name the resource, unique over time and space e.g. urn:isbn:12345x

- `start-line` is called: `request-line` in a request and `status-line` when its part of a response.

- A 400 (Bad request) response to be sent if a request does not strictly follow the HTTP-Message format

## Misc

- `CRLF` = `\r\n`, `CR` moves cursor to the 0th column and `LF` moves it down one row
