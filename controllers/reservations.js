const Reservation = require('../models/Reservation');
const MassageShop = require('../models/MassageShop')

//@desc     Get all appoinments 
//@route    Get /api/v1/appointents
//@access   Public


exports.getReservations = async (req, res, next) => {
    let query;
    console.log("Yo")

    if(req.user.role !== 'admin'){
        console.log("Yo2")
        if(req.params.massageShopId){
            console.log(req.params.massageShopId);
            query = Reservation.find({massageShop : req.params.massageShopId, user : req.user.id}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            },
            );
        }else{
            query = Reservation.find({user : req.user.id}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }
    }else {
        if(req.params.massageShopId){
            console.log(req.params.massageShopId);
            query = Reservation.find({massageShop : req.params.massageShopId}).populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }else{
            query = Reservation.find().populate({
                path: 'massageShop',
                select : 'name address tel opentime closetime'
            });
        }
        //If you are an admin you can see all
    }
    try {
        const reservations = await query;
        res.status(200).json({
            success : true, 
            count : reservations.length,
            data : reservations
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find Reservations'
        })
    }
}

//@desc     Get one appoinment
//@route    Get /api/v1/appointents/:id
//@access   Private

exports.getReservation = async (req, res, next) => {
    try {
        console.log("Check 11")
        const reservation = await Reservation.findById(req.params.id).populate({
            path : 'massageShop',
            select : 'name address tel opentime closetime'
        });
        console.log("Check 22")
        if(!reservation){
            return res.status(404).json({success:false, message:`No reservation with the id of ${req.params.id}` });
        }
        res.status(200).json({
            success : true,  
            data : reservation
        })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : 'Cannot find the Reservation'
        })
    }
}

//@desc     Add one appoinments 
//@route    Add /api/v1/reservations
//@access   Private

exports.addReservation = async (req, res, next) => {
    try {
        //Collect it at the request body
       
        req.body.massageShop = req.params.massageShopId;
        const massageShop = await MassageShop.findById(req.params.massageShopId);

        if(!massageShop){
            return res.status(404).json({success:false, message:`No Massage Shop with the id of ${req.params.massageShopId}` });
        }

        //only the person that login can update their appointment
        
        //add user Id to req.body
        req.body.user = req.user.id;

        console.log("Open time : " + massageShop.opentime);

        //Check for existed appointment
        const existedReservation = await Reservation.find({user : req.user.id});

        console.log('Number of existing reservations:', existedReservation.length);
        console.log('User role:', req.user.role);

        //if not an admin cannot create more than 3 Reservations
        if(existedReservation.length >=3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 reservations`})
        }

        const reservationTime = new Date(req.body.resDate);

        console.log("Before Change : " + reservationTime);

        const timeValue = reservationTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const secondToLastCharacter = timeValue.charAt(timeValue.length - 2);
        console.log(secondToLastCharacter);

        console.log("Reservation :" + timeValue + " Open : " + massageShop.opentime + " Close : " + massageShop.closetime)

        if ((secondToLastCharacter === "A" && timeValue < massageShop.opentime )|| (secondToLastCharacter === "P" && timeValue > massageShop.closetime )) {
            return res.status(400).json({ success: false, message: 'Reservation time is outside of business hours' });
        }

        const reservation = await Reservation.create(req.body)

        res.status(200).json({
            success : true, 
            data : reservation
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : 'Cannot create Reservation'
        })
    }
}

//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

// @desc    Update reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
    try {
    
        let reservation = await Reservation.findById(req.params.id);
        console.log(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: `No reservation with the id of ${req.params.id}`,
            });
        }
        // Make sure user is the reservation owner
        if (
            reservation.user.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this reservation`,
            });
        }
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (err) {
        console.log(err.stack);
        return res
            .status(500)
            .json({success: false, message: 'Cannot update Reservation'});
    }
};



//@desc     Update appoinments 
//@route    PUT /api/v1/appointents
//@access   Private

exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if(!reservation){
            return res.status(404).json({success : false, message : `No reservation with the id ${req.params.id}`});
        }
        //Make sure that user is the reservation owner
        if(reservation.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success : false, message: `User ${req.user.id} is not authorized to delete this reservation`});
        }

        await reservation.deleteOne();
        res.status(200).json({success : true, data : {}});
    } catch (error) {
        console.log(error.stack);
        return res.status(500).json({
            success : false, 
            message : `Cannot delete Reservation`
        })
    }
}


