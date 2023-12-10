const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.userInfo) {
        res.json({ authenticated: true, userInfo: req.session.userInfo })
    } else {
        res.json({ authenticated: false })
    }
});

module.exports = router;
