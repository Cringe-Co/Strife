import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// connect Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/strife",
});

// test route
app.get("/", (req, res) => res.send("Hello World!"));

// use http + socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("chat:message", async ({ room, user, text }) => {
    await pool.query(
      "INSERT INTO messages (room, user_name, msg) VALUES ($1, $2, $3)",
      [room, user, text]
    );
    io.to(room).emit("chat:message", { room, user, text });
  });

  socket.on("chat:join", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});