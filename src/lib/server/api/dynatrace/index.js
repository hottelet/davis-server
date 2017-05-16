"use strict";

const dynatraceRoute = require("express").Router();

const aliases = require("./aliases");
const tenants = require("./tenants");
const filters = require("./filters");

dynatraceRoute.use(aliases);
dynatraceRoute.use(tenants);
dynatraceRoute.use(filters);

module.exports = dynatraceRoute;
