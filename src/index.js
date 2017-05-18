"use strict";

/*
 * Module dependencies
 */
const BbPromise = require("bluebird");
const json = require("body-parser").json;
const connectMongo = require("connect-mongo");
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const randtoken = require("rand-token");

const MongoStore = connectMongo(session);
global.Promise = BbPromise;
mongoose.Promise = BbPromise;
dotenv.config();
if (process.env.DEBUG) {
  mongoose.set("debug", true);
}
/*
 * Davis dependencies
 */

const alexaVerification = require("./lib/server/alexa/alexa-verify");
const logger = require("./lib/core/logger");
const api = require("./lib/server/api");
const alexa = require("./lib/server/alexa");

/*
 * Startup logic
 */

const mongoString = process.env.DAVIS_MONGODB || "mongodb://localhost/davis-ng";

logger.debug("Connecting to mongodb: ", mongoString);
mongoose.connect(mongoString)
  .then(() => {
    const app = express();

    /*
    * express middlewares
    */
    logger.debug("Setting up express");
    app.use(alexaVerification);
    app.use(json());
    app.use(cors());
    app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.DAVIS_SECRET,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
      req.req_id = randtoken.generate(16);
      logger.debug({ req });
      next();
    });

    app.use("/alexa/v1", alexa.v1);
    app.use("/api/v1", api.v1);

    const port = process.env.DAVIS_PORT || 8080;
    app.listen(port);
    logger.debug(`Listening on http://0.0.0.0:${port}/`);

    // Global Error Handler
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
      // Syntax Errors are thrown by the json parser
      if (err instanceof SyntaxError) {
        return res.status(400).json({ success: false, message: err.message });
      }

      const code = err.statusCode || 500;
      const message = (err.name === "DavisError") ? err.message : "An unhandled error occurred";

      if (err.name !== "DavisError") {
        logger.error({ err });
      } else {
        logger.debug(message);
      }
      return res.status(code).json({ success: false, message });
    });
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
