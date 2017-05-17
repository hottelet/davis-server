"use strict";

const Router = require("express").Router;
const passport = require("passport");
const Local = require("passport-local").Strategy;

const Users = require("../../controllers/users");
const DError = require("../../core/error");

const auth = Router();

auth.post("/register", async (req, res, next) => {
  try {
    const model = await Users.create(req.body);

    res.status(200).json({ success: true, id: model._id });
  } catch (err) {
    next(err);
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
      next(new DError("Authentication failed.", 401));
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
  res.redirect("/");
});

auth.use((req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  throw new DError("User not authenticated.", 401);
});

module.exports = auth;
