const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.connect(42069, "127.0.0.1");

// "data" event is emitted on newLine (when enter key is registered)
process.stdin.on("data", (buffer) => {
  console.log(buffer);
  server.send(buffer);
});

// to listen for UDP Packets in powershell:
// & "C:\Program Files (x86)\Nmap\ncat.exe" -u -l 42069
