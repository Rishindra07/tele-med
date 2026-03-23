const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware.js');
const {allowRoles} = require('../middleware/roleMiddleware.js');

const { checkSymptoms, getMySymptomLogs } = require('../controllers/symptomController')

router.post('/check',protect,allowRoles("patient"),checkSymptoms );
router.get('/logs', protect, allowRoles("patient"), getMySymptomLogs);

module.exports = router;