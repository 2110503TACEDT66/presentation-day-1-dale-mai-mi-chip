const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
    const {name, tel, email, password, role} = user;
    const token = user.getSignedJwtToken();
    const option = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24*60*60*1000), //milli sec
        httpOnly : true
    };

    if(process.env.NODE_ENV === 'production'){
        option.secure = true;
    }
    res.status(statusCode).cookie('token', token, option).json({success : true, token, name, role});
}

//@desc     Register user
//@route    Post /api/v1/auth/register
//@access   Public

exports.register = async (req, res, next) => {
try {
    const {name, tel, email, password, role} = req.body;

    const user = await User.create({
        name,
        tel,
        email,
        password,
        role
    });
    
    // const token = user.getSignedJwtToken();
    // res.status(200).json({success : true, token});
    sendTokenResponse(user,200,res);
} catch (error) {
    res.status(400).json({success : false, message : error.message});
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

    console.log(user);

    if(!user){
        return res.status(400).json({success : false, msg:'No user'});
    }

    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return res.status(401).json({success : false, msg:'Invalid credentials Match'});
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

exports.getAllUsers = async (req, res, next) => {
    
    let query;

    const reqQuery = {...req.query}; //If we use const reqQuery = req.query it is pass by ref but this is pass by value

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param => delete reqQuery[param]);

    console.log('ReqQuery : ' + reqQuery);


    //req.query = 
    let queryStr = JSON.stringify(reqQuery); //Make it into String 
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = User.find(JSON.parse(queryStr));

    //Select the field

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort the fireld

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else{
        query = query.sort('-createdAt');
    }

    //Pagination

    // ,10 in this case is converting into base 10 number + || 1 -> If the answer is not a valid integer then it will be 1 
    const page = parseInt(req.query.page, 10) || 1;
    //how many result in each page default is 25
    const limit = parseInt(req.query.limit, 10) || 10;

    //number of the result ahich appear in each page
    const startIndex = (page-1)*limit || 0;
    const endIndex = page*limit || 0;

    //Count all the MassageShops
    const total = await User.countDocuments();

    //query.skip(startindex) -> Start at what, imit(limit) -> how many results that user want
    query = query.skip(startIndex).limit(limit);

    //Output Data

    try {
        const massageShops = await query;

        //Execution Pagination 
        const pagination = {};

        if(endIndex < total){
            pagination.next = {
                page : page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagination.prev = {
                page : page - 1,
                limit
            }    
        }

        res.status(200).json({
            success : true,
            count :massageShops.length,
            pagination,
            data :massageShops,
        });
    } catch (error) {
        res.status(400).json({success:false});
    }  
}
