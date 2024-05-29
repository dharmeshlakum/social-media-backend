import userModel from "../Models/User/UserCollection.js";

const signupValidationMW = async (req, res, next) => {

    try {
        const { emailAddress, password, fullName, username } = req.body;
        const regex = /@gmail\.com/;

        if (!emailAddress || !password || !fullName || !username) return res.status(400).json({ error: "All fields are required !" });
        if (password.length < 8) return res.status(400).json({ error: "Password length should be greater then 8" });
        if (!regex.test(emailAddress)) return res.status(400).json({ error: "Invalid email address" });

        const user = await userModel.findOne({ username });
        const email = await userModel.findOne({ emailAddress, isDeleted: false });

        if (user) return res.status(400).json({ error: "Username is not awailable" });
        if (email) return res.status(409).json({ error: "Email address is already registred" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export default signupValidationMW;