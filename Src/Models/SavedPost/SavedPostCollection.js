import mongoose from "mongoose";

const savedPostCollectionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
    }],

    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

const savePostModel = mongoose.model("SavedPosts", savedPostCollectionSchema);
export default savePostModel;