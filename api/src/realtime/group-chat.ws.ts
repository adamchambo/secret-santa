import { createHash } from "node:crypto";
import { Server } from "node:http";
import { Duplex } from "node:stream";
import { URL } from "node:url";

type ChatClient = {
  groupId: string;
  socket: Duplex;
};

const clientsByGroupId = new Map<string, Set<Duplex>>();

function encodeFrame(message: string) {
  const payload = Buffer.from(message);
  const header =
    payload.length < 126
      ? Buffer.from([0x81, payload.length])
      : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 0xff]);

  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer: Buffer) {
  const firstByte = buffer[0];
  const secondByte = buffer[1];
  if (firstByte === undefined || secondByte === undefined) return null;

  const opcode = firstByte & 0x0f;
  if (opcode === 0x08) return null;

  let payloadLength = secondByte & 0x7f;
  let offset = 2;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(offset);
    offset += 2;
  }

  const mask = buffer.subarray(offset, offset + 4);
  offset += 4;

  const payload = buffer.subarray(offset, offset + payloadLength);
  const decoded = Buffer.alloc(payload.length);

  for (let i = 0; i < payload.length; i++) {
    const payloadByte = payload[i];
    const maskByte = mask[i % 4];
    if (payloadByte === undefined || maskByte === undefined) return null;

    decoded[i] = payloadByte ^ maskByte;
  }

  return decoded.toString("utf8");
}

function addClient(client: ChatClient) {
  const clients = clientsByGroupId.get(client.groupId) ?? new Set<Duplex>();
  clients.add(client.socket);
  clientsByGroupId.set(client.groupId, clients);

  client.socket.on("close", () => clients.delete(client.socket));
  client.socket.on("end", () => clients.delete(client.socket));
}

function broadcastToGroup(groupId: string, message: string) {
  const clients = clientsByGroupId.get(groupId);
  if (!clients) return;

  const frame = encodeFrame(message);
  clients.forEach((socket) => {
    if (!socket.destroyed) socket.write(frame);
  });
}

function getGroupIdFromPath(pathname: string) {
  const match = pathname.match(/^\/api\/groups\/([^/]+)\/chat\/ws$/);
  return match?.[1];
}

export function attachGroupChatWebSocketServer(server: Server) {
  server.on("upgrade", (request, socket) => {
    const host = request.headers.host;
    if (!host || !request.url) return socket.destroy();

    const url = new URL(request.url, `http://${host}`);
    const groupId = getGroupIdFromPath(url.pathname);
    if (!groupId) return socket.destroy();

    const key = request.headers["sec-websocket-key"];
    if (!key || Array.isArray(key)) return socket.destroy();

    const acceptKey = createHash("sha1")
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest("base64");

    socket.write(
      [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Accept: ${acceptKey}`,
        "",
        "",
      ].join("\r\n"),
    );

    addClient({ groupId, socket });

    socket.on("data", (buffer) => {
      const decodedMessage = decodeFrame(buffer);
      if (!decodedMessage) return;

      broadcastToGroup(groupId, decodedMessage);
    });
  });
}
