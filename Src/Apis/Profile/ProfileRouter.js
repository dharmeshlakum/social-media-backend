import express from "express";
import { usernameValidationMW } from "../../Middlewares/IDvalidationMiddlewares.js";
import postModel from "../../Models/Post/PostCollection.js";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";
import profileImgMW from "../../Middlewares/ProfileImageUploadingMiddleware.js";
import { userProfileAuthorizationMW } from "../../Middlewares/Authorization.js";
import userModel from "../../Models/User/UserCollection.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { passwordVerification } from "../../Services/Password/PasswordServices.js";
import loginModel from "../../Models/Login/LoginCollection.js";

const profileRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Get Profile
profileRouter.get("/user/:username", usernameValidationMW, async (req, res) => {

    try {
        const { user } = req;
        let post = await postModel.find({ userId: user._id });
        const response = {
            userID: user._id,
            username: user.username,
            fullName: user.fullName,
            followings: user.followings,
            followers: user.followers,
            post
        }

        res.status(200).json({
            status: "success",
            user: response
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Updating Profile Picture
profileRouter.put("/user/:username/update-pic", tokenValidationMW, usernameValidationMW, profileImgMW, userProfileAuthorizationMW, async (req, res) => {

    try {
        const { user } = req;
        if (!req.file) return res.status(400).json({ error: "Please select the file first" });

        await userModel.updateOne({ _id: user._id }, {
            $set: { profilePic: req.file.filename }
        });

        res.status(200).json({
            status: "success",
            message: "Profile picture is updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Get Profile Picture
profileRouter.get("/user/:username/profile-pic", usernameValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const path = join(__dirname, `../../Assets/Profile/${user.profilePic}`);

        res.status(200).sendFile(path);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Download Profile Picture
profileRouter.get("/user/:username/download-pic", usernameValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const path = join(__dirname, `../../Assets/Profile/${user.profilePic}`);

        res.status(200).download(path);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Profile
profileRouter.put("/user/:username/update", tokenValidationMW, usernameValidationMW, profileImgMW, userProfileAuthorizationMW, async (req, res) => {

    try {
        const { validation, user } = req;
        const { fullName, username, emailAddress, about } = req.body;
        let profilePic = "";

        if (req.file) {
            profilePic = req.file.filename;
        }

        const emailData = await userModel.findOne({ emailAddress, isDeleted: false });
        const userData = await userModel.findOne({ username });

        if (emailData) return res.status(409).json({ error: "Email address is already registred" });
        if (userData) return res.status(400).json({ error: "Username is not awailable" })

        await userModel.updateOne({ _id: user._id }, {
            $set: {
                fullName: fullName == undefined ? user.fullName : fullName,
                username: username == undefined ? user.username : username,
                emailAddress: emailAddress == undefined ? user.emailAddress : emailAddress,
                bio: about == undefined ? user.about : about,
                profilePic: profilePic == "" ? user.profilePic : profilePic
            }
        });

        res.status(200).json({
            status: "success",
            message: "Profile is updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Update Password
profileRouter.put("/user/:username/update-password", tokenValidationMW, usernameValidationMW, userProfileAuthorizationMW, async (req, res) => {

    try {
        const { password, newPassword, confirmPassword } = req.body;
        const { user } = req;

        if (!password || !newPassword || !confirmPassword) return res.status(400).json({ error: "All fields are required" });
        if (newPassword.length < 8) return res.status(400).json({ error: "Password length shuold be greated then 8" });
        if (newPassword !== confirmPassword) return res.status(400).json({ error: "New Password and confirm password is not matching" });

        const validation = await passwordVerification(password, user.password);
        if (!validation) return res.status(401).json({ error: "Wrong password" });

        await userModel.updateOne({ _id: user._id }, {
            $set: { password: newPassword }
        });

        res.status(200).json({
            status: "Success",
            message: "Password is updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Delete Profile
profileRouter.delete("/user/:username/delete", tokenValidationMW, usernameValidationMW, userProfileAuthorizationMW, async (req, res) => {

    try {
        const { user } = req;
        await userModel.updateOne({ _id: user._id }, {
            $set: { isDeleted: true }
        });
        await loginModel.deleteOne({ userId: user._id })

        res.clearCookie("login");
        res.status(200).json({
            status: "Success",
            message: "Profile Deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default profileRouter;