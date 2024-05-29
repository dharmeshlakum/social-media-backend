import otpModel from "../Models/OTP/OtpCollection.js";
import userModel from "../Models/User/UserCollection.js";
import { otpVerification } from "../Services/OTP/OtpServices.js";

const emailValidationMW = async (req, res, next) => {

    try {
        const { emailAddress } = req.body;
        const regex = /@gmail\.com/;

        if (!emailAddress || !regex.test(emailAddress)) return res.status(400).json({ error: "Enter valid email address to get OTP" });

        const user = await userModel.findOne({ emailAddress, isDeleted: false });
        if (!user) return res.status(404).json({ error: "Email address is not registred !" });
        if (user.emailSubscription === false) return res.status(400).json({ error: "Email Subscription is OFF" });

        req.user = user;
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

const resetPasswordMW = async (req, res, next) => {

    try {
        const email = req.cookies["email"]
        const { password, confirmPassword, otp } = req.body;
        const userAgent = req.headers["user-agent"]

        if (!email) return res.status(401).json({ error: "Email token is missing" });
        if (!password || !confirmPassword || !otp) return res.status(400).send({ error: "all fields are required" });
        if (password !== confirmPassword) return res.status(400).send({ error: "password and confirm password are not matching" });

        const otps = await otpModel.find({
            emailAddress: email,
            userAgent
        }).sort({ timestamp: -1 }).exec();
        if (otps.length === 0) return res.status(404).json({ error: "OTP is not awailable" });

        const validation = await otpVerification(otp, otps[0].otp);
        if (!validation) return res.status(401).json({ error: "Wrong OTP" });

        req.email = email;
        req.password = password;
        next();


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { emailValidationMW, resetPasswordMW }