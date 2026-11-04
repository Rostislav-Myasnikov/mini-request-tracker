import express from "express";
import type { ErrorRequestHandler } from "express";
import ticketRoutes from "./routes/ticketRoutes";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use("/api/tickets", ticketRoutes);

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    response.status(400).json({ error: "Request body contains invalid JSON" });
    return;
  }

  console.error("Request failed", error);
  response.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server http://localhost:${port}`);
});
