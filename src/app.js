import express from "express";
import morgan from "morgan";
import cookieparser from "cookie-parser";
import { userAuthrouter } from "./routes/user.auth.route.js";
import { productRouter } from "./routes/product.route.js";

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(cookieparser());

app.use("/api", userAuthrouter);
app.use("/", productRouter);

export default app;
