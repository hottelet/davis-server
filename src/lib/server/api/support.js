"use strict";

const Router = require("express").Router;
const davis = require("../../core/davis");
const support = require("../../core/support");

const supportRoute = Router();

supportRoute.get("/plugins", (req, res) => {
  const plugins = support.getPlugins(davis);
  const slotTypes = support.getSlotTypes();

  res.json({
    success: true,
    plugins,
    slotTypes,
  });
});

module.exports = supportRoute;
