"use strict";

const Router = require("express").Router;
const Joi = require("joi");
const passport = require("passport");
const Local = require("passport-local").Strategy;

const Users = require("../../controllers/users");

const auth = Router();

auth.post("/register", async (req, res) => {
  const user = req.body;

  const schema = Joi.object().keys({
    email: Joi.string().email().lowercase().required(),
    firstName: Joi.string().min(1).max(20).required(),
    lastName: Joi.string().min(1).max(30).required(),
    password: Joi.string().min(6).required(),
  });

  const validate = Joi.validate(req.body, schema);

  if (validate.error) {
    res.status(400).json({
      message: validate.error.details[0].message,
      success: false,
    });
    return;
  }

  try {
    const model = await Users.create(user);

    res.status(200).json({ success: true, id: model._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await Users.getById(id);
  done(null, user);
});

passport.use(new Local(async (username, password, done) => {
  const user = await Users.logIn(username, password);

  if (!user) {
    done(null, false);
    return;
  }

  done(null, user);
}));

auth.post("/login", (req, res, next) => {
  passport.authenticate("local", (authErr, user) => {
    if (authErr) { next(authErr); return; }
    if (!user) {
      res.status(401).json({ success: false, message: "Authentication failed." });
      return;
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) { next(loginErr); return; }
      res.status(200).json({ success: true });
    });
  })(req, res, next);
});

auth.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).json({ success: true });
});

auth.use((req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.status(401).json({ success: false, message: "User not authenticated." });
});

module.exports = auth;
