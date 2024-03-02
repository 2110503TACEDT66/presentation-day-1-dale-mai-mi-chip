const Hospital = require('../models/Hospital');
const vacCenter = require('../models/VacCenter');

//@desc     Get vaccine centers
//@route    GET /api/v1/hospitals/vacCenters/
//@access   Public

exports.getVacCenters = (req,res,next) => {
    vacCenter.getAll((err, data) => {
        if(err){
            res.status(500).send({
                message : err.message || "Some error occurred while retrieving Vaccine Cneters."
            });
        }
        else {
            res.send(data);
        }
    })
}

exports.getMessageShops = async (req,res,next) => {
    let query;

    const reqQuery = {...req.query}; //If we use const reqQuery = req.query it is pass by ref but this is pass by value

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param => delete reqQuery[param]);

    console.log('ReqQuery : ' + reqQuery);


    //req.query = 
    let queryStr = JSON.stringify(reqQuery); //Make it into String 
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

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
    const limit = parseInt(req.query.limit, 10) || 25;

    //number of the result ahich appear in each page
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    //Count all the hospitals
    const total = await Hospital.countDocuments();

    //query.skip(startindex) -> Start at what, imit(limit) -> how many results that user want
    query = query.skip(startIndex).limit(limit);

    //Output Data

    try {
        const hospitals = await query;

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
            count : hospitals.length,
            pagination,
            data : hospitals,
        });
    } catch (error) {
        res.status(400).json({success:false});
    }
    
}

exports.getMessageShop = async (req,res,next) => {
    try {
        const hospitals = await Hospital.findById(req.params.id);
        if(!hospitals) {
            res.status(400).json({success:false});
        }
        else{
            res.status(200).json({success:true ,data : hospitals});
        }
    } catch (error) {
        res.status(400).json({success:false});
    }
}

exports.createMessageShop  = async (req,res,next) => {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({success:true, data:hospital});
}

exports.updateMessageShop  = async (req,res,next) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators: true
        })
        if (!hospital){
            res.status(400).json({success:false, message :' There is no hospital!'});
        }
        else {
            res.status(200).json({success:true, data : hospital});
        }
    } catch (error) {
        res.status(400).json({success:false,  message : error.message});
    }
    
}

exports.deleteMessageShop  = async (req,res,next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital){
            return res.status(404).json({success:false, message : `Bootcamp not found with id of ${req.params.id}`});
        }

        await hospital.deleteOne();
        res.status(200).json({success : true, data : {}})
    } catch (error) {
        console.log(error.stack);
        return res.status(400).json({success:false});
    }
    
}

