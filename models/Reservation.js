const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    resDate : {
        type : String,
        required : true,
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    massageShop : {
        type : mongoose.Schema.ObjectId,
        ref : 'MassageShop',
        required : true
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
