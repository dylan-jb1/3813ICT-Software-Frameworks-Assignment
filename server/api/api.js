const express = require('express');
const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
    next();
})

router.post('/', (req, res) => {
    res.send("Success");
})

module.exports = router;