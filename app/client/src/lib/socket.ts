// lib/socket.ts
import { WS_URL } from "@/config";
import { io } from "socket.io-client";
export const socket = io(WS_URL ?? "http://localhost:3000");
