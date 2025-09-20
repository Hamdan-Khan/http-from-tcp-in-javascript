import { createServer, Server, Socket } from "net";
import { RequestFromReader } from "../request.js";

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

  public serve() {
    if (!this.instance) {
      this.instance = createServer(this.handleConnection);
    }
    return this.instance;
  }

  public listen(port: number, callback: () => void) {
    this.instance.listen(port, callback);
  }

  private async handleConnection(socket: Socket) {
    console.log("Handling connection");

    const request = await RequestFromReader(socket);
    console.log("succesfully parsed: ", request);

    const hardCopiedRes = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 0\r\n\r\n`;
    socket.write(hardCopiedRes);

    socket.on("end", () => {
      console.log("Connection handled");
    });
  }

  public close() {
    this.state = HTTPServerState.CLOSED;
    this.instance.close();
  }
}
