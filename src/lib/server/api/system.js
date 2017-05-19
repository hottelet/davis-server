"use strict";

const Router = require("express").Router;

const version = require("../../../../package.json").version;

const systemRoute = Router();

systemRoute.get("/version", (req, res) => {
  res.json({
    success: true,
    version,
  });
});

module.exports = systemRoute;
