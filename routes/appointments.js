const express = require('express');
//The difference between {getAppointment} and getAppoinment is {} for the mutiple function/object while without it is a single function/object
const {getAppointments, getAppointment, addAppointment, updateAppointment,deleteAppointment} = require('../controllers/appointments'); 

const router = express.Router({mergeParams : true});

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(protect, getAppointments).post(protect, authorize('admin', 'user'), addAppointment);
router.route('/:id').get(getAppointment).put(protect, authorize('admin', 'user'),updateAppointment).delete(protect,authorize('admin', 'user') , deleteAppointment);

module.exports = router;


