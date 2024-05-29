import { tokenVerification } from "../Services/Token/TokenValidation.js";

const tokenValidationMW = async (req, res, next) => {

    try {
        const token = req.cookies["login"];
        if (!token) return res.status(401).json({ error: "Token is missing" });

        const validation = await tokenVerification(token);
        if (validation.exp * 1000 > Date.now()) {
            req.validation = validation;
            next();
        }

    } catch (error) {
        console.log(error);
        if (error.name == "TokenExpiredError") {
            return res.status(401).send({ error: "Token is expired.... Relogin is required !" });

        } else if (error.name == "UnauthorizedError") {
            return res.status(401).send({ error: "Unauthorized token !" });

        } else {
            res.status(500).send({ error: error.message });
        }
    }
}

export default tokenValidationMW;