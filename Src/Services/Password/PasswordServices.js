import bcrypt from "bcrypt";

async function passwordHashing(password) {
    const salt = await bcrypt.genSalt(10);
    const hashcode = await bcrypt.hash(password, salt);
    return hashcode
}

async function passwordVerification(password, hashcode) {
    const validation = await bcrypt.compare(password, hashcode);
    return validation
}

export { passwordHashing, passwordVerification }