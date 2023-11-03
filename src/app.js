import express from "express";
import routes from "./routes/index.js";

export const app = express();
app.use(express.json());

app.use("/api/v1", routes);

app.get('/api/ping', (_, res) => {
    return res.status(200).json({
        status: 200,
        message: "ok"
    });
});

app.all('*', (_, res) => {
    return res.status(404).json({
        status: 404,
        message: "Invalid URL"
    });
});
