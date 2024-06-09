import express from "express";
import { applyLeave, getAllEmployeeDetails, getOneEmployeeDetails, getRequestDetails, status, updateLeaveStatus } from "../controllers/leaveForm.js";
import { birthDayInfo, forgotPassword, getAllEmployee, getAllUser, getMyAnalytics, getOneEmployee, login, register, updatePassword } from "../controllers/control.js";
import { verifyToken } from "../TokenVadlidation/tokenValidate.js";
import { forgetPassValidation, leaveFormValidation, loginForgetPassValidation, loginValidation, registerValidation } from "../Validation/validate.js";
const user = express.Router()

user.post("/", registerValidation, register);
user.post("/login", loginValidation, login);
user.post("/applyLeave", leaveFormValidation, applyLeave);
user.post("/getAll", getAllEmployee);
user.post("/getOne", getOneEmployee);
user.post("/requestDetails", getRequestDetails);
user.post("/getform", getAllEmployeeDetails);
user.post("/getOneEmp", getOneEmployeeDetails)
user.post("/updateStatus", updateLeaveStatus)
user.post("/status", status)
user.post("/getMyAnalytics", getMyAnalytics)
user.post("/getAllUser", getAllUser)
user.post("/BirthDayInfo", birthDayInfo)
user.post("/forgotPass", loginForgetPassValidation, forgotPassword)
user.post("/updatePassword", forgetPassValidation, updatePassword)

export default user;