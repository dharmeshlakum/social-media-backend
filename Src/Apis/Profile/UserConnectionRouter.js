import express from "express";
import userModel from "../../Models/User/UserCollection.js";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";
import { usernameValidationMW } from "../../Middlewares/IDvalidationMiddlewares.js";

const connectioRouter = express.Router();

//Follow-Unfollow
connectioRouter.post("/user/:username/follow", tokenValidationMW, usernameValidationMW, async (req, res) => {

    try {
        const { user, validation } = req;
        if (validation.id == user._id) return res.status(400).json({ error: "Bad request!" });

        const followingData = await userModel.findOne({ _id: validation.id, followings: { $in: user._id } });
        if (followingData) {
            await userModel.updateOne({ _id: validation.id }, {
                $pull: { followings: user._id }
            });
            await userModel.updateOne({ _id: user._id }, {
                $pull: { followers: validation.id }
            });

            res.status(200).json({
                status: "Success",
                message: "Unfollow successfully"
            });

        } else {
            await userModel.updateOne({ _id: user._id }, {
                $push: { followers: validation.id }
            });
            await userModel.updateOne({ _id: validation.id }, {
                $push: { followings: user._id }
            });

            res.status(200).send({
                status: "Success",
                message: "Following Successfully"
            });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default connectioRouter;