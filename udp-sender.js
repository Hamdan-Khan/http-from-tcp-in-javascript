/**
 * A udp sender to demonstrate the connection-less property of udp
 * to listen for UDP Packets (with nc):
 *
 * spin this server up:
 * > node udp-sender.js
 *
 * listen to this server
 * > nc -u -l 42069
 *
 * type anything in the terminal and press Enter
 *
 * when the listener node (nc) is closed, the packets can still be sent
 * from this node, regardless of the listener's availability
 */

import { createSocket } from "dgram";
import { createInterface } from "readline";

const server = createSocket("udp4");

// to create an infinite stream of input from stdin
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("> ");
rl.prompt();

// on every new line, send it to the udp listener (nc)
rl.on("line", (line) => {
  server.send(Buffer.from(line + "\r\n"), 42069, "127.0.0.1");
  rl.prompt();
});

// to close the node and udp sender
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
