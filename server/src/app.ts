import cors from "cors";
import express from "express";
import { accountsRouter } from "./routes/accountsRoutes";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/accounts", accountsRouter);

  return app;
};
