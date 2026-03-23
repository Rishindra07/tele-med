const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware.js");
const { allowRoles } = require("../middleware/roleMiddleware.js");

// Doctor specific routes will go here

module.exports = router;
