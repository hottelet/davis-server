"use strict";

const filterRoute = require("express").Router();

const Filters = require("../../../controllers/filters");


filterRoute.get("/filters", async (req, res, next) => {
  try {
    const filters = await Filters.getFilters(req.user);

    return res.json({ success: true, filters });
  } catch (err) {
    return next(err);
  }
});

filterRoute.post("/filter", async (req, res, next) => {
  try {
    const filter = await Filters.create(req.user, req.body);
    return res.status(201).json({
      id: filter._id,
      message: "Successfully added a new filter.",
      success: true,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = filterRoute;
