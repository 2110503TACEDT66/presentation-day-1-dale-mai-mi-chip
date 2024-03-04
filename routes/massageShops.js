const express = require('express');
const {getMassageShops, getMassageShop, createMassageShop, updateMassageShop, deleteMassageShop} = require('../controllers/massageShops');

//Include other resource routers
const reservationRouter = require('./reservations');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:massageShopId/reservations/', reservationRouter);
console.log("Check1");
router.route('/Doctor');
console.log("Check2");
router.route('/').get(protect, getMassageShops).post(protect, authorize('admin'), createMassageShop);
router.route('/:id').get(protect, getMassageShop).put(protect, authorize('admin'), updateMassageShop).delete(protect, authorize('admin'), deleteMassageShop);

module.exports = router;