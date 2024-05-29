import mongoose from "mongoose";

const loginCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    token: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: () => Date.now(),
        index: {
            expireAfterSeconds: 86400
        }
    }
});

const loginModel = mongoose.model("Logins", loginCollectionSchema);
export default loginModel;