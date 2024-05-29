import mongoose from "mongoose";
import { otpHashing } from "../../Services/OTP/OtpServices.js";

const otpCollectionSchema = new mongoose.Schema({

    emailAddress: {
        type: String,
        ref: "User",
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: () => Date.now(),
        index: {
            expireAfterSeconds: 600
        }
    }
});

otpCollectionSchema.pre("save", async function (next) {
    const hashcode = await otpHashing(this.otp);
    this.otp = hashcode;
    next();
});

const otpModel = mongoose.model("OTPs", otpCollectionSchema);
export default otpModel;