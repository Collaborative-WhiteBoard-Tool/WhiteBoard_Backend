import pool from "../config/db";

export const createRoom = async (name: string) => {
  const [result] = await pool.query(
    "INSERT INTO rooms (name, created_at) VALUES (?, NOW())",
    [name]
  );
  return result;
};

export const getRooms = async () => {
  const [rows] = await pool.query("SELECT * FROM rooms ORDER BY created_at DESC");
  return rows;
};
