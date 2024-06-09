import { check, validationResult } from "express-validator"

export const registerValidation = [
    check('name').trim().notEmpty().withMessage('name cannot be empty'),
    check('age').trim().notEmpty().withMessage('age cannot be empty'),
    check('email').trim().notEmpty().withMessage('email cannot be empty'),
    check('password').trim().notEmpty().withMessage('password cannot be empty'),
    check('position').trim().notEmpty().withMessage('position cannot be empty'),
    check('dob').trim().notEmpty().withMessage('dob cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req).array()
        if (errors.length > 0) {
            return res.send({ status: 0, response: errors[0].msg })
        }

        return next()
    }
]

export const loginValidation = [
    check('email').trim().notEmpty().withMessage('email cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req).array()
        if (errors.length > 0) {
            return res.send({ status: 0, response: errors[0].msg })
        }

        return next()
    }
]
export const loginForgetPassValidation = [
    check('email').trim().notEmpty().withMessage('email cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req).array()
        if (errors.length > 0) {
            return res.send({ status: 0, response: errors[0].msg })
        }

        return next()
    }
]

export const forgetPassValidation = [
    check('email').trim().notEmpty().withMessage('email cannot be empty'),
    check('password').trim().notEmpty().withMessage('password cannot be empty'),
    check('otp').trim().notEmpty().withMessage('Otp cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req).array()
        if (errors.length > 0) {
            return res.send({ status: 0, response: errors[0].msg })
        }

        return next()
    }
]

export const leaveFormValidation = [
    check('reason').trim().notEmpty().withMessage('reason cannot be empty'),
    check('subject').trim().notEmpty().withMessage('subject cannot be empty'),
    check('from').trim().notEmpty().withMessage('From Date cannot be empty'),
    check('to').trim().notEmpty().withMessage('to Date cannot be empty'),
    (req, res, next) => {
        const errors = validationResult(req).array()
        if (errors.length > 0) {
            return res.send({ status: 0, response: errors[0].msg })
        }

        return next()
    }
]