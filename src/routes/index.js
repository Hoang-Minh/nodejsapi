const express = require("express");
const route = express.Router();

route.get("/", (req, res) => {
    res.status(200).send({ message: "Welcome to the AUTHENTICATION API. Register or Login to test Authentication."});
})

module.exports = route;