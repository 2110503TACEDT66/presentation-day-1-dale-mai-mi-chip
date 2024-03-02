const express = require('express');
//The difference between {getAppointment} and getAppoinment is {} for the mutiple function/object while without it is a single function/object
const {getReservations, getReservation, addReservation, updateReservation,deleteReservation} = require('../controllers/booking'); 

const router = express.Router({mergeParams : true});

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, getReservations).post(protect, authorize('admin', 'user'), addReservation);
router.route('/:id').get(getReservation).put(protect, authorize('admin', 'user'),updateReservation).delete(protect,authorize('admin', 'user') , deleteReservation);

module.exports = router;


