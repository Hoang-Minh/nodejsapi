const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Token = require("./token");

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: "Your email is required",
        trim: true
    },
    username: {
        type: String,
        unique: true,
        require: "Your username is required"
    },
    password: {
        type: String,
        require: true,
        max: 100
    },
    firstName: {
        type: String,
        require: true,
        max: 100
    },
    lastName: {
        type: String,
        require: true,
        max: 100
    },
    bio: {
        type: String,
        require: false,
        max: 255
    },
    profileImage: {
        type: String,
        require: false,
        max: 255
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        require: false
    },
    resetPasswordExpires: {
        type: Date,
        require: false
    }
}, {timestamps: true});

UserSchema.pre("save", function(next){
    const user = this;

    if(!user.isModified("password")) return next();
    bcrypt.genSalt(10, function(err, salt){
        if(err) return next(err);
        
        bcrypt.hash(user.password, salt, function(err, hash){
            if(err) return next(err);

            user.password = hash;
            next();
        })
    });
});

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function(){
    const today = new Date();
    const expirationnDate = new Date(today);
    expirationnDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationnDate.getTime() / 1000, 10)
    });
};

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.methods.generateVerificationToken = function(){
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString("hex")
    };

    return new Token(payload);
};

module.exports = mongoose.model("User", UserSchema);