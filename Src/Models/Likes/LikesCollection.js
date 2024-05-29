import mongoose from "mongoose";

const likeCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    contentType: {
        type: String,
        enum: ["comment", "post"],
        required: true
    },

    contentId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },

    timestamp: {
        type: Date,
        default: () => Date.now()
    }
});

const likeModel = mongoose.model("Likes", likeCollectionSchema);
export default likeModel;