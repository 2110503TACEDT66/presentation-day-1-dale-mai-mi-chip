const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name']
    },
    email : {
        type : String,
        required : [true, 'Please add a email'],
        unique : true,
        match : [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please add a valid email'
        ]
    },
    role : {
        type : String,
        enum : ['user', 'admin'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true, 'Please add a password'],
        minlength : 5,
        select : false
    },
    resetPassWordtoken : String,
    resetPassWordExpire : Date,
    createAt : {
        type : Date,
        default : Date.now
    }

});

//Encrpt password using bcrypt
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return Create a new method for UserSchema

UserSchema.methods.getSignedJwtToken = function () {
    //Get our secret to use JWT method
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRE
    });
}

UserSchema.methods.matchPassword = async function (enteredPassword) {
    //Get our secret to use JWT method
    return await bcrypt.compare(enteredPassword, this.password);
}
module.exports = mongoose.model('User', UserSchema);