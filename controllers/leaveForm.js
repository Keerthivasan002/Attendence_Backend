import transporter from "../config/config.js";
import ejs from "ejs";
import path from 'path';
import { dirname } from 'path';
import LeaveRequest from "../models/formModels.js";
import { fileURLToPath } from 'url';
import userModels from "../models/userModels.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const applyLeave = async (req, res) => {
    try {
        const userData = req.body;
        const leaveRequest = LeaveRequest({
            UserId: userData.UserId,
            email: userData.email,
            reason: userData.reason,
            from: userData.from,
            to: userData.to,
            subject: userData.subject,
            status: 0,
            message: ' '
        });
        await leaveRequest.save();
        
        const subjectMapping = {
            1: 'Sick Leave',
            2: 'Casual Leave',
            3: 'Earned Leave',
            4: 'Vacation',
            5: 'Leave Without Pay',
            6: 'Emergency Leave'
        };
        
        leaveRequest._doc.subject = subjectMapping[leaveRequest._doc.subject] || 'Unknown';

        const filePath = path.join(__dirname, "../templates/leaveRequest.ejs");
        ejs.renderFile(filePath, { reason: userData.reason }, async (err, data) => {
            if (err) {
                console.error(err);
                return res.send({ status: 0, response: 'Error rendering email template' });
            }
            try {
                await transporter.sendMail({
                    to: "keerthivasan2kk1@gmail.com",
                    subject: leaveRequest.subject,
                    html: data,
                });
                return res.send({ status: 1, response: 'Leave request sent successfully' });
            } catch (emailError) {
                console.error(emailError);
                return res.send({ status: 0, response: 'Error sending email' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.send({ status: 0, response: error.message });
    }
};


export const getRequestDetails = async (req, res) => {
    try {
        const input = req.body;
        const leaveRequest = await LeaveRequest.find({ UserId: input.UserId });
        if (leaveRequest) {
            return res.send({ status: 1, response: JSON.stringify(leaveRequest) })
        }
        return res.send({ status: 0, response: "No Leave requests has been found" })
    } catch (error) {
        return res.send({ status: 0, response: error.message })
    }
};


export const getAllEmployeeDetails = async (req, res) => {
    try {
        const aggregatePipeline = [
            {
                $match: {
                    status: { $nin: [0] }
                }
            },
            {
                $lookup: {
                    from: "usermodels",
                    localField: "UserId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $addFields: {
                    userName: { $arrayElemAt: ["$userData.name", 0] }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    userName: 1,
                    email: 1,
                    subject: 1,
                    UserId:1,
                    from:1,
                    to:1,
                    reason: 1,
                    status: 1,
                    message: 1
                }
            }
        ];

        const getAggregatedResult = await LeaveRequest.aggregate(aggregatePipeline);

        return res.send({
            status: 1,
            response: JSON.stringify(getAggregatedResult)
        });
    } catch (error) {
        console.error("Error in getAllEmployeeDetails:", error);
        return res.send({
            status: 0,
            response: `Error in controllers - getAllEmployeeDetails: ${error.message}`
        });
    }
};

export const getOneEmployeeDetails = async (req, res) => {
    try {
        const User = req.body;
        const aggregatePipeline = [
            {
                $match: {
                    email: User.email
                }
            },
            {
                $lookup: {
                    from: "leaverequests",
                    localField: "_id",
                    foreignField: "UserId",
                    as: "Requests"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    email: 1,
                    position: 1,
                    dob: 1,
                    "Requests.email": 1,
                    "Requests.subject": 1,
                    "Requests.reason": 1,
                    "Requests.from": 1,
                    "Requests.to": 1,
                    "Requests.status": 1
                }
            }
        ];

        const getAggregatedResult = await userModels.aggregate(aggregatePipeline);
        return res.send({
            status: 1,
            response: JSON.stringify(getAggregatedResult),
        });
    } catch (error) {
        return res.send({
            status: 0,
            response: `Error in controllers - getOneEmployeeDetails: ${error.message}`
        });
    }
};

export const updateLeaveStatus = async (req, res) => {
    try {
        const { email, id, status, message } = req.body;
        if (!id || !status) {
            return res.send({ status: 0, response: "Invalid Data" });
        }
        const leaveRequest = await LeaveRequest.findById(id);
        if (!leaveRequest) {
            return res.send({ status: 0, response: "Leave Request Not Found" });
        }
        await LeaveRequest.findByIdAndUpdate({ _id: id }, { status: status, message: message })
        const filePath = path.join(__dirname, "../templates/leaveRequest.ejs");
        const emailData = {
            name: "HR",
            reason: "sick leave",
            status: status,
            message: message,
        };

        ejs.renderFile(filePath, emailData, async (err, data) => {
            if (err) {
                return console.log(err);
            }
            const subject = status === 1 ? 'Leave Request Accepted' : 'Leave Request Rejected';
            const info = await transporter.sendMail({
                to: "keerthivasan2kk1@gmail.com",
                subject: subject,
                html: data,
            });
        });

        return res.send({ status: 1, response: "Status & Message Updated" });

    } catch (error) {
        return res.send({
            status: 0,
            response: `Error in controllers - updateLeaveStatus: ${error.message}`
        });
    }
};

export const status = async (req, res) => {
    try {
        const aggregatePipeline = [
            {
                $match: {
                    status: 0
                }
            },
            {
                $lookup: {
                    from: "usermodels",
                    localField: "UserId",
                    foreignField: "_id",
                    as: "userData"
                }
            },
            {
                $addFields: {
                    userName: { $arrayElemAt: ["$userData.name", 0] }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    userName: 1,
                    email: 1,
                    subject: 1,
                    reason: 1,
                    status: 1,
                    message: 1
                }
            }
        ];
        const getAggregatedResult = await LeaveRequest.aggregate(aggregatePipeline);
        if (getAggregatedResult.length !== 0) {
            return res.send({ status: 1, response: JSON.stringify(getAggregatedResult) });
        }
        return res.send({ status: 0, response: "Something went wrong" })
    } catch (error) {
        return res.send({ status: 0, response: `Error in controllers - status: ${error.message}` });
    }
}

