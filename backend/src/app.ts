import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import { createServer } from "http";
import moment from "moment-timezone";
import morgan from "morgan";
import errorHandler, { notfoundandler } from "./middleware/errorHandler";
import router from "./router/router";
const app: Application = express();

app.use(helmet());
app.set("trust proxy", true);
morgan.token("bd-time", () => {
  //@ts-ignore
  return moment().tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");
});
morgan.token("real-ip", (req: Request) => req.ip);
app.use(
  morgan(
    ":bd-time :method :url :status :response-time ms - :res[content-length] :real-ip",
  ),
);

// Reason: CORS_ORIGINS (comma-separated) lets VPS/internal testers add a domain without editing code.
const defaultCorsOrigins = [
  "http://accounts.techelementbd.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://iconichishab.com",
  "https://iconichishab.com",
];
const extraOrigins =
  process.env.CORS_ORIGINS?.split(/[,;]/).map((s) => s.trim()).filter(Boolean) ?? [];
const corsOrigins = [...new Set([...defaultCorsOrigins, ...extraOrigins])];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// Run seeding on startup
// seedDatabase().catch(console.error);

app.get("/", async (req: Request, res: Response) => {
  try {
    res.status(200).send({
      success: true,
      statusCode: 200,
      message: "Accounts Server Is Running 11",
    });
  } catch (err: any) {
    console.log("Error Response Data:", err?.response?.data);
    console.log("Error Message:", err?.message);
    console.log("Error Status:", err?.response?.status);

    res.status(err?.response?.status || 500).send({
      success: false,
      statusCode: err?.response?.status || 500,
      message: err?.response?.data?.message || "Something went wrong",
      data: err?.response?.data || err.message,
    });
  }
});

app.use("/api/v1", router);

app.use(notfoundandler);
app.use(errorHandler);

const server = createServer(app);

export default server;
