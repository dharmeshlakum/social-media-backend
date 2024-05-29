import userModel from "../Models/User/UserCollection.js";
import postModel from "../Models/Post/PostCollection.js";
import commentModel from "../Models/Comments/CommentCollection.js";

//User Profile Authorization
const userProfileAuthorizationMW = async (req, res, next) => {

    try {
        const { user, validation } = req;

        if (!user) return res.status(404).json({ error: "User not found" });
        if (!validation) return res.status(401).json({ error: "Token is missing" });
        if (user._id != validation.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Post Authorization
const postAuthorizationMW = async (req, res, next) => {

    try {
        const { post, validation } = req;

        if (!post) return res.status(405).json({ error: "Post not found" });
        if (!validation) return res.status(401).json({ error: "Token is misisng" });
        if (post.userId != validation.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Comment Update Authorization
const commentUpdateAuthMW = async (req, res, next) => {

    try {
        const { comment, validation } = req;

        if (!comment) return res.status(405).json({ error: "Comment not found" });
        if (!validation) return res.status(401).json({ error: "Token is misisng" });
        if (comment.userId != validation.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Comment Delete Authorization
const commentDeleteAuthMW = async (req, res, next) => {

    try {
        const { comment, validation } = req;
        const post = await postModel.findOne({ _id: comment.postId });
        if (!post) return res.status(404).send({ error: "Post not found" });

        if (validation.id == comment.userId || validation.id == post.userId) {
            if (!comment.subComment) {
                await postModel.updateOne({ _id: post._id }, {
                    $pull: { comments: comment._id }
                });
            }

            next();

        } else return res.status(401).json({ error: "Unauthorized" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Reply Delete Authorization
const replyDeleteAuthMW = async (req, res, next) => {

    try {
        const { reply, validation } = req;

        if (!reply) return res.status(404).json({ error: "Reply not found" });
        if (!validation) return res.status(401).json({ error: "Token is missing" });
        if (validation.id != reply.senderId || validation.id != reply.recieverId) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Collection Delete Authorization
const collectionAuthorizationMW = async (req, res, next) => {

    try {
        const { collection, validation } = req;

        if (!collection) return res.status(404).json({ error: "Collection not found" });
        if (!validation) return res.status(401).json({ error: "Token is missing" });
        if (collection.userId != validation.id) return res.status(401).json({ error: "Unauthorized" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { postAuthorizationMW, userProfileAuthorizationMW, commentUpdateAuthMW, commentDeleteAuthMW, replyDeleteAuthMW, collectionAuthorizationMW }