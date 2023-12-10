const express = require('express');
const router = express.Router();
const userLocationsUtils = require('../utils/userLocations');

router.get('/', (req, res) => {
    const userLocations = userLocationsUtils.readUserLocations();
    res.json(userLocations);
});

router.post('/update-location', (req, res) => {
    const { userId, location, profileImageUrl } = req.body;
    userLocationsUtils.updateUserLocation(userId, location, profileImageUrl);
    res.json({ message: 'Location updated successfully' });
});

module.exports = router;
