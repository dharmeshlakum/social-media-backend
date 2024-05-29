import express from "express";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";
import postMediaUploaderMW from "../../Middlewares/PostMediaUploadingMiddleware.js";
import postModel from "../../Models/Post/PostCollection.js";
import { postIDvalidationMW, usernameValidationMW } from "../../Middlewares/IDvalidationMiddlewares.js";
import { postAuthorizationMW } from "../../Middlewares/Authorization.js";

const postRouter = express.Router();

//Create Post
postRouter.post("/post", tokenValidationMW, postMediaUploaderMW, async (req, res) => {

    try {
        const { validation } = req;
        const { caption } = req.body;
        let media = [];

        if (!caption) return res.status(400).json({ error: "Caption is required" });
        if (req.files && req.files.length > 0) {
            media = req.files.map(value => value.filename);

        } else return res.status(400).json({ error: "Select file first...." });

        const post = new postModel({
            media,
            caption,
            userId: validation.id
        });
        const savePost = await post.save();

        res.status(201).json({
            status: "Post created successfully",
            post: savePost
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get All Post Of Any One User
postRouter.get("/post/user/:username", usernameValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const post = await postModel.find({ userId: user._id });
        const response = post.map(value => ({
            postID: value._id,
            userID: value.userId,
            media: value.media,
            likes: value.likes.length,
            comments: value.comments.length,
            lastUpdate: value.lastUpdate,
            createdAt: value.createdAt
        }));

        res.status(200).json({
            status: "Success",
            posts: response
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get Post ::> Any One
postRouter.get("/post/:postId", postIDvalidationMW, async (req, res) => {

    try {
        const { post } = req;
        const response = {
            postID: post._id,
            userID: post.userId,
            media: post.media,
            likes: post.likes.length,
            comments: post.comments.length,
            lastUpdate: post.lastUpdate,
            createdAt: post.createdAt
        }

        res.status(200).json({
            status: "success",
            post: response
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Post
postRouter.put("/post/:postId/update", tokenValidationMW, postIDvalidationMW, postAuthorizationMW, postMediaUploaderMW, async (req, res) => {

    try {
        const { post } = req;
        const { caption } = req.body;
        let media = [];

        if (req.files && req.files.length > 0) {
            media = req.files.map(file => file.filename);
        }

        await postModel.updateOne({ _id: post._id }, {
            $set: {
                caption: caption ? caption : post.caption,
                media: media.length == 0 ? post.media : media,
                lastUpdate: Date.now()
            }
        });

        res.status(200).json({
            status: "success",
            message: "Post is updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Post
postRouter.delete("/post/:postId/delete", tokenValidationMW, postIDvalidationMW, postAuthorizationMW, async (req, res) => {

    try {
        const { post } = req;
        await postModel.deleteOne({ _id: post._id });

        res.status(200).json({
            status: "Success",
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default postRouter;