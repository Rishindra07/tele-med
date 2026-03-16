const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware.js');
const {allowRoles} = require('../middleware/roleMiddleware.js');

const checkSymptoms = require('../controllers/symptomController.js')

router.post('/check',protect,allowRoles("patient"),checkSymptoms );

module.exports = router;