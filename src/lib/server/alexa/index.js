"use strict";

const Router = require("express").Router;

const davis = require("../../core/davis");
const logger = require("../../core/logger");
const DError = require("../../core/error");
const lex = require("../../core/lex");

const userController = require("../../controllers/users");
const auth = require("../api/auth");

const v1 = Router();

v1.post("/ask", async (req, res) => {
  try {
    if (!req.alexaVerified && !process.env.MANAGED && process.env.NODE_ENV === "production") {
      logger.error("Received an unauthentic Alexa request");
      throw new DError("Not an authentic Alexa request", 401);
    } else if (process.env.NODE_ENV !== "production" && process.env.ALEXA_DEV_EMAIL) {
      logger.warn("Mocking an Alexa user.");
      req.user = await userController.getByEmail(process.env.ALEXA_DEV_EMAIL);
    }

    if (!req.user) throw new DError("I'm sorry but this is not a valid account!");

    const response = await davis.alexaAsk(req.user, req.body);

    return res.json(response);
  } catch (err) {
    const message = (err.name === "DavisError") ?
      err.message : "Unfortunately an unhandled error has occurred.";

    logger.error({ err }, message);
    return res.json({
      version: 1.0,
      sessionAttributes: {},
      response: {
        shouldEndSession: true,
        outputSpeech: {
          type: "SSML",
          ssml: `<speak>${message}</speak>`,
        },
      },
    });
  }
});

v1.use(auth);

v1.get("/export", async (req, res, next) => {
  try {
    const config = await lex.lexToAlexa();

    return res.json(config);
  } catch (err) {
    return next(err);
  }
});

module.exports.v1 = v1;
