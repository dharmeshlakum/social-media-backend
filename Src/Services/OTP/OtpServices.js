import bcrypt from "bcrypt";

async function otpHashing(otp) {
    const salt = await bcrypt.genSalt(10);
    const hashcode = await bcrypt.hash(otp, salt);
    return hashcode
}

async function otpVerification(otp, hashcode) {
    const validation = await bcrypt.compare(otp, hashcode);
    return validation
}

export { otpHashing, otpVerification }