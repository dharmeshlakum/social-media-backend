import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passwordHashing } from "../../Services/Password/PasswordServices.js";

const userCollectionSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    emailAddress: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    bio: {
        type: String,
        default: ""
    },

    profilePic: {
        type: String,
        default: "default-profile-pic.jpg"
    },

    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    isDeleted: {
        type: Boolean,
        default: false
    },

    emailSubscription: {
        type: Boolean,
        default: true
    },

    savedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavedPosts"
    }],

    lastLogin: {
        type: Date,
        default: null
    },

    registredAt: {
        type: Date,
        default: () => Date.now()
    }

});

userCollectionSchema.pre("save", async function (next) {
    const hashcode = await passwordHashing(this.password);
    this.password = hashcode;
    next();
});

userCollectionSchema.pre("updateOne", async function (next) {

    try {
        const update = this.getUpdate();
        if (update.$set && update.$set.password) {
            const hashcode = await passwordHashing(update.$set.password);
            update.$set.password = hashcode;
            next();
        }

    } catch (error) {
        next(error)
    }
});

userCollectionSchema.methods.tokenGenerate = async function () {
    const token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
    return token;
}

const userModel = mongoose.model("Users", userCollectionSchema);
export default userModel;