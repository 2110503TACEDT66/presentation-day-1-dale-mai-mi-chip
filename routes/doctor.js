const express = require('express');
//The difference between {getAppointment} and getAppoinment is {} for the mutiple function/object while without it is a single function/object
const {getDoctors, getDoctor, addDoctor, updateDoctor,deleteDoctor} = require('../controllers/doctor'); 

const router = express.Router({mergeParams : true});

const {protect, authorize} = require('../middleware/auth');
router.route('/').get(protect, getDoctors).post(protect, authorize('admin'), addDoctor);

router.route('/:id').get(protect, getDoctor).put(protect, authorize('admin', 'user'),updateDoctor).delete(protect,authorize('admin', 'user') , deleteDoctor);

module.exports = router;


