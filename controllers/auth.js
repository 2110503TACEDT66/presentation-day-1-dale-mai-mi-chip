const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const option = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24*60*60*1000), //milli sec
        httpOnly : true
    };

    if(process.env.NODE_ENV === 'production'){
        option.secure = true;
    }
    res.status(statusCode).cookie('token', token, option).json({success : true, token});
}

//@desc     Register user
//@route    Post /api/v1/auth/register
//@access   Public

exports.register = async (req, res, next) => {
try {
    const {name, email, password, role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    });
    
    // const token = user.getSignedJwtToken();
    // res.status(200).json({success : true, token});
    sendTokenResponse(user,200,res);
} catch (error) {
    res.status(400).json({success : false});
    console.log(error.stack)
}
}

//@desc     Login user
//@route    Post /api/v1/auth/login
//@access   Public

exports.logout = async (req,res,next) => {
    res.cookie('token', null, {
        expires : new Date(Date.now() + 10*1000),
        httpOnly : true
    });

    res.status(200).json({
        success : true,
        data : {}
    })
}

//@desc     Login user
//@route    Post /api/v1/auth/login
//@access   Public

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    //Validate email and password
    if(!email || !password){
        return res.status(400).json({success : false, msg:'Please provide an email and password'});
    }
    
    //The + symbol is used as a modifier to explicitly include the field that is typically excluded.
    const user = await User.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({success : false, msg:'Invalid credentials'});
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success : false, msg:'Invalid credentials'});
    }

    // const token = user.getSignedJwtToken();
    // res.status(200).json({success : true, token});
    sendTokenResponse(user,200,res);
}

exports.getMe = async (req, res, next) => {
    
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success : true,
        data : user
    });    
}
