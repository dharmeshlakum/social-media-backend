import { createTransport } from "nodemailer";

const transporter = createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function mailSenderFN(email, subject, text) {
    const mailOption = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject,
        text
    }
    await transporter.sendMail(mailOption, function (err, info) {
        if (err) {
            console.log("Email Sending Error :::>", err);

        } else {
            console.log("Email Sended Successfully :::>", info.response);
        }
    });
}

export default mailSenderFN;