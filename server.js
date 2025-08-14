const fs = require("fs");
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
  const stream = fs.createReadStream("messages.txt", {
    highWaterMark: 8,
  });
  const server = net.createServer((c) => {
    c.on("connectionAttempt", () => {
      console.log("----- Connection made!!!!");
    });
    c.on("end", () => {
      console.log("client disconnected");
    });
    c.write("yoooo\r\n");
    c.pipe(c);
  });

  server.listen(8124, () => {
    console.log("server bound");
  });

  const emitter = getLines(stream);

  emitter.on("line", (args) => {
    console.log(args);
  });

  emitter.on("end", (args) => {
    console.log(args);
  });
}

main();
