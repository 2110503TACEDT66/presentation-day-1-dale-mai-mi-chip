const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name'],
        unique : true
    },
    tel : {
        type : String,
        required : [true, 'Please add your telephone number']
    },
    massageShop : {
        type : mongoose.Schema.ObjectId,
        ref : 'MassageShop',
        required : true
    }
});


module.exports = mongoose.model('Doctor', DoctorSchema);
