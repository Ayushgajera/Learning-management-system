// socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:8000"); //  backend URL
socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});