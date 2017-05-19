"use strict";

const Joi = require("joi");
const moment = require("moment-timezone");
const Router = require("express").Router;

const DError = require("../../core/error");
const logger = require("../../core/logger");
const davis = require("../../core/davis");

const askRoute = Router();

askRoute.post("/", async (req, res, next) => {
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

    return res.status(200).json({ success: true, response: dres });
  } catch (err) {
    return next(err);
  }
});

module.exports = askRoute;
