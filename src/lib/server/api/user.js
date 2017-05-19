const Router = require("express").Router;
const Users = require("../../controllers/users");

const userRoute = Router();


userRoute.route("/")
  .get((req, res) => {
    res.json({
      success: true,
      user: {
        email: req.user.email,
        name: {
          first: req.user.firstName,
          last: req.user.lastName,
        },
        timezone: req.user.timezone,
        voiceNavigation: req.user.voiceNavigation,
      },
    });
  })
  .put(async (req, res, next) => {
    try {
      await Users.update(req.user._id, req.body);
      return res.json({ success: true, message: "Successfully updated your user profile." });
    } catch (err) {
      return next(err);
    }
  });

module.exports = userRoute;
