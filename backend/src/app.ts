import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", usersRouter);

app.use((err:any, req:any, res:any, next:any) => {
  console.error(err);
  if (err && err.status) return res.status(err.status).json({ error: err.message });
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
