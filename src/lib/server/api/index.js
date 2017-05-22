// global modules
const Router = require("express").Router;

// davis modules
const DError = require("../../core/error");

// routes
const auth = require("./auth");
const dynatrace = require("./dynatrace");
const support = require("./support");
const system = require("./system");
const ask = require("./ask");
const user = require("./user");

const v1 = Router();

v1.use(auth);

v1.use("/ask", ask);
v1.use("/user", user);
v1.use("/support", support);
v1.use("/system", system);
v1.use("/dynatrace", dynatrace);

// Global API 404
v1.use((req, res, next) => { next(new DError("Invalid route!", 404)); }); // eslint-disable-line no-unused-vars

module.exports.v1 = v1;
