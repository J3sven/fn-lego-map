const express = require('express');
const router = express.Router();
const userRouter = require('../api/user');
const userLocationsRouter = require('../api/userLocations');

router.use('/user', userRouter);
router.use('/user-locations', userLocationsRouter);

module.exports = router;
