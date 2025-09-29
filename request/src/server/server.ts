import { createServer, Server, Socket } from "net";
import { RequestFromReader } from "../request.js";
import { HTTPResponse } from "../response/response.js";
import type { ParsedRequestInterface } from "../types.js";

enum HTTPServerState {
  CLOSED = "closed",
  OPEN = "open",
}

export interface HandlerError {
  statusCode: number;
  message: string;
}

export type RequestHandlerType = (
  request: ParsedRequestInterface,
) => HandlerError | string;

export class HTTPServer {
  private instance!: Server;
  private state: HTTPServerState;
  private handler!: RequestHandlerType;

  constructor() {
    this.state = HTTPServerState.OPEN;
  }

  /**
   * initializes the tcp server instance
   */
  public serve(handler: RequestHandlerType) {
    if (!this.instance) {
      console.log("Creating a server instance!");
      this.instance = createServer(this.handleConnection.bind(this));
    }
    if (handler) {
      this.handler = handler;
    }
    return this.instance;
  }

  /**
   * binds a port to the server
   *
   * @param port - port to be bound
   * @param callback - to execute after binding
   */
  public listen(port: number, callback: () => void) {
    this.instance.listen(port, callback);
  }

  /**
   * handles the incoming data from the connected socket
   * and sends back a response
   */
  private async handleConnection(socket: Socket) {
    console.log("Handling connection");

    const request = await RequestFromReader(socket);
    if (!request) {
      console.log("Couldn't parse request");
      return;
    }
    console.log("succesfully parsed: ", request);

    const HttpRes = new HTTPResponse();

    const handlerError = this.handler(request);
    let statusCode;
    let message;
    // error when its an object, when its a string it has succeeded
    if (typeof handlerError === "object") {
      statusCode = handlerError.statusCode;
      message = handlerError.message;
    } else {
      statusCode = 200;
      message = handlerError;
    }

    const statusLine = HttpRes.writeStatusLine(statusCode);

    HttpRes.getDefaultHeaders(message.length);
    const headers = HttpRes.writeHeaders();

    const response = statusLine + headers + message;

    socket.write(response);

    socket.on("end", () => {
      console.log("Connection handled");
    });
  }

  public close() {
    this.state = HTTPServerState.CLOSED;
    this.instance.close();
  }
}
