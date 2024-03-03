const mongoose = require('mongoose');

const MessageShopSchema = new mongoose.Schema({
    
    name:{
        type : String,
        required : [true, 'Please add your name'],
        unique : true,
        trim : true,
        maxlength : [50, 'Name can not be more than 50 characters']
    },
    address:{
        type : String,
        required : [true, 'Please add an address']
    },
    tel: {
        type : String,
    },
    opentime: {
        type : String,
        required : [true, 'Please type an open-time']
    },
    closetime: {
        type : String,
        required : [true, 'Please type an close-time']
    }},{
        toJSON : {virtuals : true},
        toObject : {virtuals : true}
    }
);

//Reverse populate with virtuals
MessageShopSchema.virtual('appointments', {
    ref : 'Appointment',
    localField : '_id',
    foreignField : 'messageShop',
    justOne : false
});

//Cascade delete appointments when a messageShop is deleted

MessageShopSchema.pre('deleteOne', { document: true, query: false }, async function(next){
    console.log(`Appointments being removed from messageShop ${this._id} `);
    await this.model('Appointment').deleteMany({messageShop: this._id});
    next();
})

module.exports = mongoose.model('MessageShop', MessageShopSchema);