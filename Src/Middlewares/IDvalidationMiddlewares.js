import commentModel from "../Models/Comments/CommentCollection.js";
import messageModel from "../Models/Message/MessageCollectionSchema.js";
import postModel from "../Models/Post/PostCollection.js";
import savePostModel from "../Models/SavedPost/SavedPostCollection.js";
import userModel from "../Models/User/UserCollection.js";

//Usename validation
const usernameValidationMW = async (req, res, next) => {

    try {
        const { username } = req.params;
        const user = await userModel.findOne({ username });

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isDeleted === true) return res.status(410).json({ error: "User's profile is deleted" });

        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Post Id validation
const postIDvalidationMW = async (req, res, next) => {

    try {
        const { postId } = req.params;
        const post = await postModel.findOne({ _id: postId });

        if (!post) return res.status(404).json({ error: "Post not found" });
        req.post = post;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Comment ID validation
const commentIDvalidationMW = async (req, res, next) => {

    try {
        const { commentId } = req.params;
        const comment = await commentModel.findOne({ _id: commentId });

        if (!comment) return res.status(404).json({ error: "Comment is not found" });
        req.comment = comment;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Reply ID Validation
const replyIDvalidation = async (req, res, next) => {

    try {
        const { replyId } = req.params;
        const reply = await messageModel.findOne({ _id: replyId });

        if (!reply) return res.status(404).json({ error: "Reply not found" });
        req.reply = reply;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Collection Name Validation
const collectionNameValidation = async (req, res, next) => {

    try {
        const { collectionName } = req.params;
        const { validation } = req;
        const collection = await savePostModel.findOne({userId: validation.id, name: collectionName });

        if (!collection) return res.status(404).json({ error: "Collection not found !" });
        req.collection = collection;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { usernameValidationMW, postIDvalidationMW, commentIDvalidationMW, replyIDvalidation, collectionNameValidation }