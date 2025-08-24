import { Request, Response } from "express";
import * as roomService from "../services/roomService";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Room name is required" });

    const room = await roomService.createRoom(name);
    res.status(201).json({ message: "Room created", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRooms = async (_req: Request, res: Response) => {
  try {
    const rooms = await roomService.getRooms();
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
