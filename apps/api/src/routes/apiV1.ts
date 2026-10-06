import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { reportRouter } from "../modules/reports/report.routes.js";

export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/reports", reportRouter);