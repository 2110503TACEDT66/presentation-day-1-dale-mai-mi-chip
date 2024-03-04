const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'Please add a name']
    },
    tel : {
        type : String,
        required : [true, 'Please add your telephone number']
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    reservation : {
        type : mongoose.Schema.ObjectId,
        ref : 'reservation',
        unique : true,
    },
    massageShop : {
        type : mongoose.Schema.ObjectId,
        ref : 'MassageShop',
        required : true
    }

});

DoctorSchema.virtual('reservations', {
    ref : 'Reservation',
    localField : '_id',
    foreignField : 'doctor',
    justOne : false
});

DoctorSchema.pre('deleteOne', { document: true, query: false }, async function(next){
    console.log(`Reservations being removed from Doctor ${this._id} `);
    await this.model('Reservation').deleteMany({massageShop: this._id});
    next();
})




module.exports = mongoose.model('Doctor', DoctorSchema);
