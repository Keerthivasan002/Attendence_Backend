import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: "vasanvasan944@gmail.com",
    port: 465,
    secure: true,
    service: "gmail",
    auth: {
        user: "vasanvasan944@gmail.com",
        pass: "pwdd mqrv rwtx rpsd",
    },
});

export default transporter;