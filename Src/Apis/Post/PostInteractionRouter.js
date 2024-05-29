import express from "express";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";
import { commentIDvalidationMW, postIDvalidationMW, replyIDvalidation } from "../../Middlewares/IDvalidationMiddlewares.js";
import likeModel from "../../Models/Likes/LikesCollection.js";
import postModel from "../../Models/Post/PostCollection.js";
import commentModel from "../../Models/Comments/CommentCollection.js";
import { commentDeleteAuthMW, commentUpdateAuthMW, replyDeleteAuthMW } from "../../Middlewares/Authorization.js";
import messageModel from "../../Models/Message/MessageCollectionSchema.js";

const postInteractionRouter = express.Router();

//Like On Post
postInteractionRouter.post("/post/:postId/like", tokenValidationMW, postIDvalidationMW, async (req, res) => {

    try {
        const { post, validation } = req;
        const like = await likeModel.findOne({
            contentType: "post",
            contentId: post._id,
            userId: validation.id
        });

        if (like) {
            await postModel.updateOne({ _id: post._id }, {
                $pull: { likes: like._id }
            });

            await likeModel.deleteOne({ _id: like._id });

            res.status(200).json({
                status: "Success",
                message: "Like remove successfully"
            });

        } else {
            const newLike = new likeModel({
                userId: validation.id,
                contentId: post._id,
                contentType: "post"
            });
            const savelike = await newLike.save();
            await postModel.updateOne({ _id: post._id }, {
                $push: { likes: savelike._id }
            });

            res.status(200).json({
                status: "Success",
                message: "Like added successfully"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Comment On Post
postInteractionRouter.post("/post/:postId/comment", tokenValidationMW, postIDvalidationMW, async (req, res) => {

    try {
        const { post, validation } = req;
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "message filed is required" });

        const comment = new commentModel({
            postId: post._id,
            userId: validation.id,
            message
        });
        const savedata = await comment.save();
        await postModel.updateOne({ _id: post._id }, {
            $push: { comments: savedata._id }
        });

        res.status(200).json({
            status: "Success",
            comment: savedata
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get Comment
postInteractionRouter.get("/comment/:commentId", commentIDvalidationMW, async (req, res) => {

    try {
        const { comment } = req;
        let subComments = await commentModel.find({ parentComment: comment._id });

        if (subComments.length !== 0) {
            subComments = subComments.map(value => ({
                userId: value.userId,
                message: value.message,
                likes: value.likes.length,
                replies: value.replies.length,
                timestamp: value.timestamp
            }));
        }
        const response = {
            userID: comment.userId,
            postID: comment.postId,
            message: comment.message,
            likes: comment.likes.length,
            timestamp: comment.timestamp,
            subComments
        }

        res.status(200).json({
            status: "Success",
            commentData: response
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Like Comment
postInteractionRouter.post("/comment/:commentId/like", tokenValidationMW, commentIDvalidationMW, async (req, res) => {

    try {
        const { comment, validation } = req;
        const like = await likeModel.findOne({
            userId: validation.id,
            contentId: comment._id,
            contentType: "comment"
        });

        if (like) {
            await commentModel.updateOne({ _id: comment._id }, {
                $pull: { likes: like._id }
            });
            await likeModel.deleteOne({ _id: like._id });

            res.status(200).json({
                status: "Success",
                message: "Like remove successfully"
            })

        } else {
            const newLike = new likeModel({
                userId: validation.id,
                contentId: comment._id,
                contentType: "comment"
            });
            const savedata = await newLike.save();
            await commentModel.updateOne({ _id: comment._id }, {
                $push: { likes: savedata._id }
            });

            res.status(200).json({
                status: "Success",
                message: "Like added successfully"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Comment On comment
postInteractionRouter.post("/comment/:commentId/comment", tokenValidationMW, commentIDvalidationMW, async (req, res) => {

    try {
        const { comment, validation } = req;
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "message filed is required" });

        const newComment = new commentModel({
            userId: validation.id,
            postId: comment.postId,
            message,
            subComment: true,
            parentComment: comment._id
        });
        const savedata = await newComment.save();

        res.status(200).json({
            status: "Suuccess",
            comment: savedata
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Comment
postInteractionRouter.put("/comment/:commentId/update", tokenValidationMW, commentIDvalidationMW, commentUpdateAuthMW, async (req, res) => {

    try {
        const { comment } = req;
        const { message } = req.body;

        await commentModel.updateOne({ _id: comment._id }, {
            $set: {
                message: message ? message : comment.message
            }
        });

        res.status(200).json({
            status: "Success",
            message: "Comment is updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Comment
postInteractionRouter.delete("/comment/:commentId/delete", tokenValidationMW, commentIDvalidationMW, commentDeleteAuthMW, async (req, res) => {

    try {
        const { comment } = req;
        await commentModel.deleteOne({ _id: comment._id });

        res.status(200).json({
            status: "Success",
            message: "Comment is deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Reply On Comment
postInteractionRouter.post("/comment/:commentId/reply", tokenValidationMW, commentIDvalidationMW, async (req, res) => {

    try {
        const { comment, validation } = req;
        const { message } = req.body;
        if (!message) return res.status(400).send({ error: "Message field is required" });

        const reply = new messageModel({
            senderId: validation.id,
            recieverId: comment.userId,
            message
        });
        const savedata = await reply.save();
        await commentModel.updateOne({ _id: comment._id }, {
            $push: { replies: savedata._id }
        });

        res.status(200).json({
            status: "Success",
            message: "Reply is sended successfullt"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Reply
postInteractionRouter.delete("/reply/:replyId/delete", tokenValidationMW, replyIDvalidation, replyDeleteAuthMW, async (req, res) => {

    try {
        const { reply } = req;
        await messageModel.deleteOne({ _id: reply._id });

        const comment = await commentModel.findOne({ replies: reply._id });
        if (!comment) return res.status(404).json({ error: "Comment no found" });

        await commentModel.updateOne({ _id: comment._id }, {
            $pull: { replies: reply._id }
        });

        res.status(200).json({
            status: "Success",
            message: "Reply deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default postInteractionRouter;