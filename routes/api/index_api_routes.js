const express = require("express");
const v1ApiRoutes = require("./v1/index_routes_v1");

const router = express.Router();

router.use("/v1", v1ApiRoutes);

module.exports = router;