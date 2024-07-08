import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: [3, "First Name must contain at least 3 characters!"],
    },
    lastName:{
        type: String,
        required: true,
        minLength: [3, "Last Name must contain at least 3 characters!"]
    },
    email:{
        type: String,
        required: true,
        validate: [validator.isEmail,"please provide a valid email"],
    },
    phone:{
        type: String,
        required: true,
        minLength: [10,"phone number must contain 10 digits"],
        maxLength: [10,"phone number must contain 10 digits"],
    },
    nic:{
        type: String,
        required: true,
        minLength: [5,"NIC must contain exact 5 digits!"],
        maxLength: [5,"NIC must contain exact 5 digits!"],
    }, 
    dob:{
        type: Date,
        required: [true,"DOB is required"],
    },
    gender: {
        type: String,
        required: [true],
        enum: ["Male", "Female"],
        
    },
    password:{
        type: String,
        minLength: [8, "password must contain at least 8 characters!"],
        required: true,
        select: false
    },
    role:{
        type: String,
        required: true,
        enum: ["Admin", "Patient", "Doctor"],
    },
    doctorDepartment: {
        type: String,
    },
    docAvatar: {
        public_id: String,
        url: String,
    },

});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRES});                                                   
};


export const User = mongoose.models.User || mongoose.model ("User",userSchema);
