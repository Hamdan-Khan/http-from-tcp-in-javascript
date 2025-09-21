import { createServer, Server, Socket } from "net";
import { RequestFromReader } from "../request.js";
import { HTTPResponse } from "../response/response.js";

enum HTTPServerState {
  CLOSED = "closed",
  OPEN = "open",
}

export class HTTPServer {
  private instance: Server;
  private state: HTTPServerState;

  constructor() {
    this.instance = this.serve();
    this.state = HTTPServerState.OPEN;
  }

  /**
   * initializes the tcp server instance
   */
  public serve() {
    if (!this.instance) {
      this.instance = createServer(this.handleConnection);
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
    console.log("succesfully parsed: ", request);

    const HttpRes = new HTTPResponse();

    const statusLine = HttpRes.writeStatusLine(
      HTTPResponse.StatusCode.CODE_200,
    );
    const hardCodedBody = "hard coded body!!!!";
    HttpRes.getDefaultHeaders(hardCodedBody.length);
    const headers = HttpRes.writeHeaders();

    const response = statusLine + headers + hardCodedBody;

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
