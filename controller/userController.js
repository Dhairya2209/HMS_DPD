import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import {User} from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async(req,res,next)=> {
    const {firstName,lastName, email, phone, password, gender, dob, nic, role,} = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !role
    ) {
        return next(new ErrorHandler("please fill full form", 400));
    }
    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("user already exist", 400));
    }
    user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role,
    });
    generateToken(user, "User registered",200, res);
    
});

export const login = catchAsyncErrors(async(req,res,next) => {
    const {email, password, confirmPassword,role} =req.body;
    if(!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("please fill full form", 400));
    }

    if(password !== confirmPassword){
        return next(new ErrorHandler("password not match", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("user not found", 400));
    }
    const isPasswordMatched= await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("password not match", 400));
    }
    if(role !== user.role){
        return next(new ErrorHandler("role not match", 400));
    }

    generateToken(user, "User Login Successfully!",200, res);


});


export const addNewAdmin = catchAsyncErrors(async(req,res,next) => {
    const {firstName,lastName, email, phone, password, gender, dob, nic,} = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic
    ) {
        return next(new ErrorHandler("please fill full form", 400));
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this email already exist`));
    }
    const admin = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role: "Admin"
    });
    res.status(200).json({
        success: true,
        message: "admin added successfully",
    });

});


export const getAllDoctors = catchAsyncErrors(async(req,res,next) => {
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
        success: true,
        doctors
    });
});


export const getUserDetails = catchAsyncErrors(async(req,res,next)=> {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});


export const logoutAdmin= catchAsyncErrors(async(req,res,next)=> {
    res.status(201).cookie("adminToken"," ",{
        httpOnly:true,
        expires:new Date(Date.now()),
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "logout successfully",
    });
});


export const logoutPatient= catchAsyncErrors(async(req,res,next)=> {
    res.status(201).cookie("patientToken"," ",{
        httpOnly:true,
        expires:new Date(Date.now()),
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "logout successfully",
    });
});


export const addNewDoctor = catchAsyncErrors(async(req,res,next)=> {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Doctor Avatar required", 400));
    }
    const {docAvatar} = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(docAvatar.mimetype)){
        return next(new ErrorHandler("file format not supported", 400));
    }
    const {firstName,lastName, email, phone, password, gender, dob, nic,doctorDepartment} = req.body;
    if(
       (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !doctorDepartment
       ) 
    ){
        return next(new ErrorHandler("please fill full form", 400));
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this email already exist`));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
            "cloudinary error:",
            cloudinaryResponse.error ||  "unknown cloudinary error"
        );
    }

    const doctor = await User.create({
        firstName,lastName, email, phone, password, gender, dob, nic,doctorDepartment,role:"Doctor",docAvatar:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    res.status(200).json({
        success: true,
        message: "New Doctor added successfully",
        doctor
    });
});






