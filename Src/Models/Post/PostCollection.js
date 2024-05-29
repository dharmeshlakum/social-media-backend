import mongoose from "mongoose";

const postCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    caption: {
        type: String,
        required: true
    },

    media: {
        type: [String],
        default: []
    },

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    }],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments"
    }],

    lastUpdate: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

const postModel = mongoose.model("Posts", postCollectionSchema);
export default postModel;