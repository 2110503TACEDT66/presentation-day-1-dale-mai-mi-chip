const Appointment = require('../models/Reservation');
const Hospital = require('../models/MessageShop')

//@desc     Get all appoinments 
//@route    Get /api/v1/appointents
//@access   Public

exports.getAppointments = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin'){
        query = Appointment.find({user : req.user.id}).populate({
            path: 'hospital',
            select : 'name province tel'
        });
    }else {
        if(req.params.hospitalId){
            console.log(req.params.hospitalId);
            query = Appointment.find({hospital : req.params.hospitalId}).populate({
                path: 'hospital',
                select : 'name province tel'
            });
        }else{
            query = Appointment.find().populate({
                path: 'hospital',
                select : 'name province tel'
            });
        }
        //If you are an admin you can see all
    }
    try {
        const appointments = await query;
        res.status(200).json({
            success : true, 
            count : appointments.length,
            data : appointments
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find the appoinment'
        })
    }
}

//@desc     Get one appoinment
//@route    Get /api/v1/appointents/:id
//@access   Private

exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path : 'hospital',
            select : 'name description tel'
        });

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}` });
        }
        res.status(200).json({
            success : true, 
            data : appointment
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find the appoinment'
        })
    }
}

//@desc     Add one appoinments 
//@route    Add /api/v1/appointments
//@access   Private

exports.addAppointment = async (req, res, next) => {
    try {
        //Collect it at the request body
       
        req.body.hospital = req.params.hospitalId;
        const hospital = await Hospital.findById(req.params.hospitalId);

        if(!hospital){
            return res.status(404).json({success:false, message:`No hospital with the id of ${req.params.hospitalId}` });
        }

        //only the person that login can update their appointment
        
        //add user Id to req.body
        req.body.user = req.user.id;

        //Check for existed appointment
        const existedAppointment = await Appointment.find({user : req.user.id});

        //if not an admin cannot create more than 3 appointments
        if(existedAppointment.length >=3 && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `The user with ID ${req.user.id} has already made 3 appointments`})
        }

        const appointment = await Appointment.create(req.body)

        res.status(200).json({
            success : true, 
            data : appointment
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : 'Cannot create the appointment'
        })
    }
}

//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        if(!appointment){
            return res.status(404).json({success:false, message : `No appointment with the id of ${req.params.id}`})
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true //For checking Data
        });
        res.status(200).json({success : true, data : appointment})
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : `Cannot update the appoinment `
        })
    }
}



//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

exports.deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success : false, message : `Np appointment with the id ${req.params.id}`});
        }
        //Make sure that user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success : false, message: `User ${req.user.id} is not authorized to delete this bootcamp`});
        }

        await appointment.deleteOne();
        res.status(200).json({success : true, data : {}});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : `Cannot delete the appoinment `
        })
    }
}


