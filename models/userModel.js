const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');

const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user should has a name'],
    },
    email: {
        type: String, 
        required: [true, 'A user should has an email'],
        unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'please, provide a valid email adress!!'
        }
    },
    photo: {type: String, default: 'default.jpg'},
    password: {
        type: String,   
        required: [true, 'A user should has a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user should has a password confirmation'],
        validate: {
            validator: function (){
                return this.password === this.passwordConfirm;
            },
            message : `Passwords isn\'t the same`
        }
    },
    changedPasswordDate: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
        // select: false
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew)
        return next();
    this.changedPasswordDate = Date.now() - 1000;
    next();
});

userSchema.pre('save', async function (next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')) return next();  
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^find/, async function(next){
    this.find({active: {$ne: false}});
    next();
});

userSchema.methods.correctPassword = async function(password, correctPassword){
    return await bcrypt.compare(password, correctPassword);
};

userSchema.methods.isChangedPassword = function (tokenCreatedTime){
    if(this.changedPasswordDate)
    {
        const changedPasswordTime = parseInt(this.changedPasswordDate.getTime() / 1000, 10);
        return tokenCreatedTime < changedPasswordTime;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function (){
    const passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return passwordResetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;



