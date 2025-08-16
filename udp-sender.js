import { createSocket } from "dgram";
import { createInterface } from "readline";

const server = createSocket("udp4");
server.connect(42069, "127.0.0.1");

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("> ");
rl.prompt();

rl.on("line", (line) => {
  // udp sends the packet regardless of the listener's connection
  server.send(Buffer.from(line));
  rl.prompt();
});

rl.on("SIGINT", () => {
  console.log("\nClosing UDP sender...");
  server.disconnect();
  server.close();
  process.exit(0);
});

// "data" event is emitted on newLine (when enter key is registered)
// process.stdin.on("data", (buffer) => {
//   console.log(buffer);
//   server.send(buffer);
// });

// to listen for UDP Packets in powershell:
// & "C:\Program Files (x86)\Nmap\ncat.exe" -u -l 42069
