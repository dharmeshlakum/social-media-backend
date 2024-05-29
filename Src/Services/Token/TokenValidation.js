import jwt from "jsonwebtoken";

async function tokenVerification(token) {
    const validation = await jwt.verify(token, process.env.SECRET_KEY);
    return validation
}

export { tokenVerification }