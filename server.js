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

    socket.on("join-room", ({ roomId, userId }) => {
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
          admitted: true,
        });
      }

      socket.join(roomId);
      const usersInRoom = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      );
      console.log(`Users in room ${roomId}:`, usersInRoom);

      // Notify existing users about new participant
      socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });

      // Send existing participants to the new user
      const existingUsers = rooms[roomId].users.filter(
        (user) => user.userId !== userId
      );
      socket.emit("existing-users", existingUsers);

      socket.on("disconnect", () => {
        rooms[roomId].users = rooms[roomId].users.filter(
          (user) => user.userId !== userId
        );
        socket.to(roomId).emit("user-left", userId);
        console.log(`User ${userId} left room ${roomId}`);
      });
    });

    // WebRTC signaling handlers
    socket.on("offer", (data) => {
      socket.to(data.target).emit("offer", {
        fromId: socket.id,
        offer: data.offer,
      });
    });

    socket.on("answer", (data) => {
      socket.to(data.target).emit("answer", {
        fromId: socket.id,
        answer: data.answer,
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.target).emit("ice-candidate", {
        fromId: socket.id,
        candidate: data.candidate,
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
