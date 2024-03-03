const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    resDate : {
        type : Date,
        required : true,
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    MessageShop : {
        type : mongoose.Schema.ObjectId,
        ref : 'MessageShop',
        required : true
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);
