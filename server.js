const EventEmitter = require("events");
const net = require("net");

function getLines(stream) {
  const emitter = new EventEmitter();

  let currentLine = "";
  stream.on("data", (buffer) => {
    const parts = buffer.toString().split("\n");

    currentLine += parts[0];

    if (parts.length > 1) {
      emitter.emit("line", currentLine);

      currentLine = parts[1];
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
  const server = net.createServer((socket) => {
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
