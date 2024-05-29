import mongoose from "mongoose";

const commentCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    subComment: {
        type: Boolean,
        default: false
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
        default: null
    },

    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Messages"
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Likes"
    }],

    timestamp: {
        type: Date,
        default: () => Date.now()
    }
});

const commentModel = mongoose.model("Comments", commentCollectionSchema);
export default commentModel;