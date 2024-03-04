const Doctor = require('../models/Doctor');
const MassageShop = require('../models/MassageShop')

//@desc     Get all appoinments 
//@route    Get /api/v1/appointents
//@access   Public


exports.getDoctors = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin'){
        if(req.params.massageShopId){
            console.log(req.params.massageShopId);
            query = Doctor.find({massageShop : req.params.massageShopId, user : req.user.id}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }else{
            query = Doctor.find({user : req.user.id}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }
    }else {
        if(req.params.massageShopId){
            console.log(req.params.massageShopId);
            query = Doctor.find({massageShop : req.params.massageShopId}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }else{
            query = Doctor.find().populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }
        //If you are an admin you can see all
    }
    try {
        const doctors = await query;
        res.status(200).json({
            success : true, 
            count : doctors.length,
            data : doctors
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find Doctors'
        })
    }
}

//@desc     Get one appoinment
//@route    Get /api/v1/appointents/:id
//@access   Private

exports.getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate({
            path : 'massageShop',
            select : 'name address tel opentime closetime'
        });

        if(!doctor){
            return res.status(404).json({success:false, message:`No doctor with the id of ${req.params.id}` });
        }
        res.status(200).json({
            success : true, 
            data : doctor
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find the doctor'
        })
    }
}



exports.addDoctor = async (req, res, next) => {
    try {
        //Collect it at the request body
       console.log("C1");
        req.body.massageShop = req.params.massageShopId;
        const massageShop = await MassageShop.findById(req.params.massageShopId);

        if(!massageShop){
            return res.status(404).json({success:false, message:`No Massage Shop with the id of ${req.params.massageShopId}` });
        }

        //only the person that login can update their appointment
        console.log("C2");
        //add user Id to req.body

        console.log("C3");
        const doctor = await Doctor.create(req.body)

        res.status(200).json({
            success : true, 
            data : doctor
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : error.message
        })
    }
}

//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

exports.updateDoctor = async (req, res, next) => {
    try {
        let doctor = await Doctor.findById(req.params.id);
        if(!doctor){
            return res.status(404).json({success:false, message : `No doctor with the id of ${req.params.id}`})
        }
        //Make sure user is the appointment owner

        doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true //For checking Data
        });
        res.status(200).json({success : true, data : doctor})
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : `Cannot update doctor`
        })
    }
}



//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

exports.deleteDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if(!doctor){
            return res.status(404).json({success : false, message : `No doctor with the id ${req.params.id}`});
        }
        //Make sure that user is the doctor owner

        await doctor.deleteOne();
        res.status(200).json({success : true, data : {}});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : `Cannot delete doctor`
        })
    }
}


