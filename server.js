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
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join-room", ({ roomId, userId,username }) => {
      // Initialize room if it doesn't exist
      if (!rooms[roomId]) {
        rooms[roomId] = {
          users: [],
          connections: {},
        };
      }

      // Add user to room if not already present
      if (!rooms[roomId].users.some((user) => user.userId === userId)) {
        rooms[roomId].users.push({
          userId,
          socketId: socket.id,
          username
        });
      }

      socket.join(roomId);
      const usersInRoom = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      );
      console.log(`Users in room ${roomId}:`, usersInRoom);

      // Notify existing users about new participant
      socket
        .to(roomId)
        .emit("user-joined", { userId, socketId: socket.id, username });
      io.to(socket.id).emit("join-room", { userId, socketId: socket.id, username });

      socket.on("disconnect", () => {
        rooms[roomId].users = rooms[roomId].users.filter(
          (user) => user.userId !== userId
        );
        socket.to(roomId).emit("user-left", userId);
        console.log(
          `User ${userId} left room ${roomId}, socketId:${socket.id}`
        );
      });
    });

    socket.on("offer", ({ to, offer, fromAppUserId, fromUsername }) => {
      socket
        .to(to)
        .emit("offer", {
          offer,
          fromSocketId: socket.id,
          fromAppUserId,
          fromUsername,
        });
    });

    socket.on("answer", ({ to, answer }) => {
      socket.to(to).emit("answer", { answer, fromSocketId: socket.id });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", {
        candidate,
        fromSocketId: socket.id,
      });
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
