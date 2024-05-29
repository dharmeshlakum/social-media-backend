import loginModel from "../Models/Login/LoginCollection.js";
import userModel from "../Models/User/UserCollection.js";
import { passwordVerification } from "../Services/Password/PasswordServices.js";

const loginValidationMW = async (req, res, next) => {

    try {
        const { userInput, password } = req.body;
        if (!userInput || !password) return res.status(400).send({ error: "All Fields are reqired!" });

        const user = await userModel.findOne({
            $or: [
                { username: userInput },
                { emailAddress: userInput }
            ]
        });
        if (!user) return res.status(404).json({ error: "Invalid email address | Username" });
        if(user.isDeleted == true) return res.status(400).json({error: "Profile is deleted"})

        const logins = await loginModel.findOne({ userId: user._id });
        if (logins) {
            if (logins.userAgent === req.headers["user-agent"]) return res.status(409).json({ error: `${user.username} is already login on this device` });
            return res.status(409).json({ error: `${user.username} is already login on other device` });

        } else {
            const validation = await passwordVerification(password, user.password);
            if (!validation) return res.status(401).json({ error: "Wrong password" });

            req.user = user;
            next();
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export default loginValidationMW;