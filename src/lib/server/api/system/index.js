"use strict";

const Router = require("express").Router;
const davis = require("../../../core/davis");
const support = require("../../../core/support");
const version = require("../../../../../package.json").version;
const systemRoute = Router();

systemRoute.get("/version", (req, res) => {
  res.json({
    success: true,
    version,
  });
});

systemRoute.get("/plugins", (req, res) => {
  const plugins = support.getPlugins(davis);
  const slotTypes = support.getSlotTypes();

  res.json({
    success: true,
    plugins,
    slotTypes,
  });
});

module.exports = systemRoute;
