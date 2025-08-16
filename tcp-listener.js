/**
 * demonstration of connection-oriented property of tcp
 * for establishing a tcp connection to this listener node:
 * > telnet localhost 42069
 *
 * when the listener node (this node) is closed, the sender node (telnet)
 * is terminated as well, i.e. connection is necessary for sending packets
 */

import EventEmitter from "events";
import { createServer } from "net";

/**
 * converts stream of bytes from the tcp sender into formatted lines
 * emits a "line" event when a newline is found
 * emits an "end" event when stream ends
 */
function getLines(stream) {
  const emitter = new EventEmitter();

  let currentLine = "";

  stream.on("data", (buffer) => {
    const parts = buffer.toString().split("\n");

    currentLine += parts[0];

    if (parts.length > 1) {
      for (let i = 1; i < parts.length; i++) {
        emitter.emit("line", currentLine);
        currentLine = parts[i];
      }
    }
  });

  stream.on("end", () => {
    if (currentLine) {
      emitter.emit("end", currentLine);
    }
  });

  return emitter;
}

async function main() {
  // a tcp server, logging the received bytes
  const server = createServer((socket) => {
    console.log("connection opened");

    const emitter = getLines(socket);

    emitter.on("line", (args) => {
      console.log(args);
    });

    socket.on("end", () => {
      console.log("connection closed");
    });
  });

  server.listen(42069, () => {
    console.log("server bound");
  });
}

main();
