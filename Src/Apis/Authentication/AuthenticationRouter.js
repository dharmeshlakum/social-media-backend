import express from "express";
import userModel from "../../Models/User/UserCollection.js";
import signupValidationMW from "../../Middlewares/SignupValidationMiddleware.js";
import loginValidationMW from "../../Middlewares/LoginValidationMiddleware.js";
import loginModel from "../../Models/Login/LoginCollection.js";
import { otpLimit } from "../../Middlewares/RequestLimit.js";
import { emailValidationMW, resetPasswordMW } from "../../Middlewares/ForgetPasswordMiddleware.js";
import otpModel from "../../Models/OTP/OtpCollection.js";
import mailSenderFN from "../../Middlewares/Nodemailer.js";
import tokenValidationMW from "../../Middlewares/TokenValidationMiddleware.js";

const authenticationRouter = express.Router();

//Signup
authenticationRouter.post("/signup", signupValidationMW, async (req, res) => {

    try {
        const { emailAddress, password, fullName, username } = req.body;
        const user = new userModel({
            emailAddress,
            password,
            fullName,
            username
        });
        const savedata = await user.save();

        res.status(201).json({
            status: "User created successfully",
            user: savedata
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Login
authenticationRouter.post("/login", loginValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const userAgent = req.headers["user-agent"];
        const token = await user.tokenGenerate();

        const login = new loginModel({
            userId: user._id,
            userAgent,
            token
        });
        await login.save();

        res.cookie("login", token, {
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            status: "success",
            message: `${user.username} login successfully`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Forget Password :::> Get OTP
authenticationRouter.post("/forget-password", otpLimit, emailValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const otp = Math.floor(Math.random() * (9999 - 1000) + 1000).toString();
        const userAgent = req.headers["user-agent"];
        const newOTP = new otpModel({
            emailAddress: user.emailAddress,
            otp,
            userAgent
        });
        await newOTP.save();

        let email = user.emailAddress;
        let subject = "Node Js [Password Reset]"
        let message = `Hello\n${user.username}\n\nYou requested for password reset..... Here is an OTP to reset password\nOTP :: ${otp}\n\n if you did't requested safely ignore it.`
        await mailSenderFN(email, subject, message);

        //Warning Mail
        const otps = await otpModel.find({ emailAddress: email });
        if (otps.length >= 3) {
            subject = "Node Js [Warning]";
            message = "We have recive multiple request for reset password....";
            await mailSenderFN(email, subject, message)
        }

        res.cookie("email", user.emailAddress, {
            maxAge: 5 * 60 * 1000
        });
        res.status(200).json({
            status: "Success",
            message: "OTP sended successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Foregt Password :::> Reset Password
authenticationRouter.post("/reset-password", resetPasswordMW, async (req, res) => {

    try {
        const { email, password } = req;
        await userModel.updateOne({ emailAddress: email, isDeleted: false }, {
            $set: { password }
        });

        let subject = "Password Reset Successfully !";
        let message = "Your password has beend reseted successfully...\nif it's not done by you your account is on risk... Secure it with reseting password";
        await mailSenderFN(email, subject, message);

        res.clearCookie("email");
        res.status(200).json({
            status: "Success",
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

//Logout
authenticationRouter.post("/logout", tokenValidationMW, async (req, res) => {

    try {
        const { validation } = req;
        await loginModel.deleteOne({ userId: validation.id });

        res.clearCookie("login");
        res.status(200).json({ error: "User logout successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

export default authenticationRouter;