import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authenticationRouter from "./Apis/Authentication/AuthenticationRouter.js";
import postRouter from "./Apis/Post/PostRouter.js";
import profileRouter from "./Apis/Profile/ProfileRouter.js";
import connectioRouter from "./Apis/Profile/UserConnectionRouter.js";
import postInteractionRouter from "./Apis/Post/PostInteractionRouter.js";
import savepostRouter from "./Apis/Post/SavedPostRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: `http://localhost:${PORT}`,
    methods: ["port", "put"]
}));
app.use(cookieParser());

app.use(authenticationRouter);
app.use(profileRouter);
app.use(connectioRouter);
app.use(postRouter);
app.use(postInteractionRouter);
app.use(savepostRouter);

app.listen(PORT, ()=> console.log(`Server is running on port number :::> ${PORT}`))