// src/lib/socket.ts
import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_HTTP_URL, {
  transports: ['websocket'], // Optional but helps avoid polling fallback
});
