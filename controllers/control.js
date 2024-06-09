import user from "../models/userModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import ejs from "ejs"
import transporter from "../config/config.js";
import LeaveRequest from "../models/formModels.js";
import path from 'path';
import crypto from "crypto"
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { fileURLToPath } from 'url';
import cron from "node-cron"
import mongoose from "mongoose";
import { response } from "express";
const ObjectId = mongoose.Types.ObjectId
dotenv.config()

export const register = async (req, res) => {
    try {
        let userInfo, findOne, bcryptPass, insert
        userInfo = req.body;
        if (Object.keys(userInfo).length === 0) {
            return res.send({ status: 0, response: "invalid syntax" });
        }
        findOne = await user.findOne({ email: userInfo.email })
        if (findOne) {
            return res.send({ status: 0, response: "User Already Exist" })
        }
        bcryptPass = await bcrypt.hash(userInfo.password, 8);
        userInfo.password = bcryptPass;
        insert = await user.create(userInfo);
        if (insert) {
            return res.send({ status: 1, response: "User Registered sucessfully" })
        }
    } catch (error) {
        return res.send({ status: 0, response: error.message })
    }
}


export const login = async (req, res) => {
    try {
        let input, find, checkPass, token
        input = req.body;
        if (Object.keys(input).length === 0) {
            return res.send({ status: 0, response: "invalid syntax" })
        }
        find = await user.findOne({ email: input.email })
        if (!find) {
            return res.send({ status: 0, response: "Invalid Email" })
        }
        checkPass = await bcrypt.compare(input.password, find.password)
        if (checkPass === false) {
            return res.send({ status: 0, response: "invalid password" });
        }
        token = jwt.sign({ id: find._id, name: find.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
        if (token) {
            return res.send({ status: 1, response: "Employee Login successfull", token: token, EmpID: find._id, role: find.role })
        }
        return res.send({ status: 0, response: "Something went wrong" })
    } catch (error) {
        return res.send({ status: 0, response: error.message })
    }
}

export const getOneEmployee = async (req, res) => {
    try {
        const { EmpID } = req.body;
        const find = await user.findById({ _id: EmpID });
        if (!find) {
            return res.send({ status: 0, response: "No User Information has been found" });
        }
        return res.send({ status: 1, response: JSON.stringify(find) });
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
};


export const getAllEmployee = async (req, res) => {
    try {
        let input = req.body;
        let userA = await user.findById({ _id: input.EmpID });
        if (userA.role === 2) {
            let users = await user.find();
            let filteredUsers = users.filter(user => user.role !== 2);

            if (filteredUsers.length > 0) {
                return res.send({ status: 1, response: JSON.stringify(filteredUsers) });
            }
        }
        return res.send({ status: 0, response: "No user has been registered" });
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
}

export const getAllUser = async (req, res) => {
    try {
        let users = await user.find({ role: 1 });
        return res.send({ status: 1, response: JSON.stringify(users) });

    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
}

export const getMyAnalytics = async (req, res) => {
    try {
        let input = req.body, aggregatePipeline = [], getData;
        aggregatePipeline = [
            {
                $match: {
                    UserId: new ObjectId(input.userId),
                    status: { $nin: [0] }
                }
            },
            {
                $group: {
                    _id: "$subject",
                    totalCount: { $sum: 1 }
                }
            }
        ]
        getData = await LeaveRequest.aggregate(aggregatePipeline);
        if (getData != undefined) {
            return res.send({ status: 1, data: JSON.stringify(getData) });
        }
        return res.send({ status: 0, response: "Something went wrong" });
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
};

export const checkAndSendBirthdayEmails = async (req, res) => {
    try {
        let date = new Date();
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let dM = `${day}-${month}`;
        const find = await user.find({
            $expr: {
                $eq: [
                    { $dateToString: { format: "%d-%m", date: "$dob" } },
                    dM
                ]
            }
        }, { name: 1, email: 1 });

        if (find.length > 0) {
            for (const user of find) {
                const filePath = path.join(__dirname, "../templates/bDay.ejs");

                const emailData = {
                    name: user.name
                };

                ejs.renderFile(filePath, emailData, async (err, data) => {
                    if (err) {
                        return console.log(err);
                    }
                    const subject = 'Happy Birthday';
                    const info = await transporter.sendMail({
                        to: user.email,
                        cc: [
                            "keerthivasan2kk1@gmail.com"
                        ],
                        subject: subject,
                        html: data,
                    });
                });
            }
            return res.send({ status: 1, response: "Happy Birthday" });
        }
        return res.send({ status: 0, response: "No birthdays today" });
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
}

export const birthDayInfo = async (req, res) => {
    const result = await checkAndSendBirthdayEmails();
    return res.send(result);
};

cron.schedule('7 10 * * *', async () => {
    const result = await checkAndSendBirthdayEmails();
    console.log(result.response);
    console.log('Running cron job for birthday emails at 10:07 AM');
});


export const forgotPassword = async (req, res) => {
    try {
        let input, ifExist, randomNumber, update
        input = req.body;
        if (!input) {
            return res.send({ status: 0, response: "Please provide email" });
        }
        ifExist = await user.findOne({ email: input.email })
        if (!ifExist) {
            return res.send({ status: 0, response: "Email not found" });
        }
        function generateSixDigitRandomNumber() {
            return crypto.randomInt(100000, 1000000).toString();
        }
        randomNumber = generateSixDigitRandomNumber();
        update = await user.findByIdAndUpdate({ _id: ifExist._id }, { otp: randomNumber }, { new: true })
        console.log(update);
        if (update) {
            const filePath = path.join(__dirname, "../templates/forgetPass.ejs");

            const emailData = {
                name: ifExist.name,
                otp: update.otp
            };

            ejs.renderFile(filePath, emailData, async (err, data) => {
                if (err) {
                    return console.log(err);
                }
                const subject = "OTP to Change Password";
                const info = await transporter.sendMail({
                    to: ifExist.email,
                    subject: subject,
                    html: data,
                });
            });
            return res.send({ status: 1, response: "Otp sent Successfully" })
        }
        return res.send({ status: 0, response: "Something went worng" })
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
}

export const updatePassword = async (req, res) => {
    try {
        let input, ifExist, updatePass, bcryptPass
        input = req.body;
        if (!input.email) {
            return res.send({ status: 0, response: "Please provide email" });
        }
        ifExist = await user.findOne({ email: input.email })
        if (ifExist.otp === input.otp) {
            bcryptPass = await bcrypt.hash(input.password, 8)
            updatePass = await user.findByIdAndUpdate({ _id: ifExist._id }, { password: bcryptPass })
            if (updatePass) {
                return res.send({ status: 1, response: "Password Updated Sucessfully" })
            }
        } else {
            return res.send({ status: 0, response: "Invalid OTP" })
        }
        return res.send({ status: 0, response: "Something went worng in UpdatePAssword" })
    } catch (error) {
        return res.send({ status: 0, response: error.message });
    }
}