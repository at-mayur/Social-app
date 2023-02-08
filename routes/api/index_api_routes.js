const express = require("express");
const v1ApiRoutes = require("./v1/index_routes_v1");

const router = express.Router();

// API index router for all api requests
// directs to respective version's index route her v1
router.use("/v1", v1ApiRoutes);

module.exports = router;