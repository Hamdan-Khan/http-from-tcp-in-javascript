# Notes

## HTTP-Message

The format of an HTTP request / response

```
start-line CRLF
*( field-line CRLF)
CRLF
[ message-body ]
```

request-line (for requests):

```
request-line = <method> <space> <target> <space> <http-version>
```

status-line (for responses):

```
status-line = <http-version> <space> <status-code> <space> <reason-phrase>
```

### Headers

Headers / field-line must follow this format:

```
<optional-space> <field-name> <":"> <optional-space> <value> <optional-space>
```

Some valid examples:

```
'Host: localhost:42069'
'    Host: localhost:42069'
'Host:     localhost:42069'
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

- `Content-length` header is required in response (otherwise alternatives to be used: `Transfer-Encoding` for chunked data). Sending a response without `Content-Length` would make the client timeout eventually because it won't know when the request ends.

- TCP socket in node js emits `end` event when it closes the connection (probably after receiving the response from us i.e. server). There is no way of knowing the end of an HTTP message from TCP events. We must use `Content-Length` (in case of requests with a body) or a `CRLF` right after the headers, which means there isn't any body to figure out the end of the message.
