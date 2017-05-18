// global modules
const Router = require("express").Router;
const Joi = require("joi");
const moment = require("moment-timezone");

// davis modules
const davis = require("../../core/davis");
const logger = require("../../core/logger");
const DError = require("../../core/error");

// routes
const auth = require("./auth");
const dynatrace = require("./dynatrace");
const system = require("./system");

const v1 = Router();

v1.use(auth);

v1.post("/ask", async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      raw: Joi.string().min(1).required(),
      timezone: Joi.any().valid(moment.tz.names()).options({ language: { any: { allowOnly: "is invalid" } } }),
    });

    const validate = Joi.validate(req.body, schema);

    if (validate.error) {
      throw new DError(validate.error.details[0].message, 400);
    } else if (validate.value.timezone) {
      const tz = validate.value.timezone;
      if (req.user.timezone !== tz) {
        logger.info({ user: req.user }, `Updating the timezone to '${tz}' for this request.`);
        req.user.tempTimezone = tz;
      }
    }

    const dreq = {
      raw: validate.value.raw,
      scope: `${req.user.tenant.id}:web:${req.user.email}:${req.sessionID}`,
      user: req.user,
    };

    const dres = await davis.ask(dreq);

    res.status(200).json({ success: true, response: dres });
  } catch (err) {
    next(err);
  }
});

v1.use("/system", system);
v1.use("/dynatrace", dynatrace);

// Global API 404
v1.use((req, res, next) => { next(new DError("Invalid route!", 404)); }); // eslint-disable-line no-unused-vars

module.exports.v1 = v1;
