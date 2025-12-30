// socket.js
import { io } from "socket.io-client";
import config from "../config/index";

export const socket = io(config.API_BASE_URL); //  backend URL
socket.on("connect", () => {
  // console.log("Connected to WebSocket server");
});