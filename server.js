const fs = require("fs");
const EventEmitter = require("events");

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
      emitter.emit("line", currentLine);
    }
  });

  return emitter;
}

async function main() {
  const stream = fs.createReadStream("messages.txt", {
    highWaterMark: 8,
  });

  const emitter = getLines(stream);

  emitter.on("line", (args) => {
    console.log(args);
  });
}

main();
