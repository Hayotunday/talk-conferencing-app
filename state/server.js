import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export let io;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer, {
    transports: ["websocket", "polling"],
  });

  const users = {};

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", ({ roomId, userId, role }) => {
      if (!users[roomId]) users[roomId] = [];
      if (
        userId &&
        users[roomId] &&
        !users[roomId].some((user) => user.userId === userId)
      ) {
        users[roomId].push({
          userId,
          socketId: socket.id,
          role,
          admitted: true,
        });
        console.log("users:", users);
      }

      socket.join(roomId);
      io.to(roomId).emit("user-joined", { userId, peer: users[roomId] });

      socket.on("disconnect", () => {
        users[roomId] = users[roomId].filter((id) => id !== userId);
        socket.broadcast.to(roomId).emit("user-left", userId);
      });
    });

    socket.on("call", (data) => {
      socket.to(data.target).emit("call", data);
    });

    socket.on("answer", (data) => {
      socket.to(data.target).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.target).emit("ice-candidate", data);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`\n> Ready on http://${hostname}:${port}\n`);
    });
});
