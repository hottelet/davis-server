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

filterRoute.route("/filters/:id(([0-9a-f]{24}))")
  .get(async (req, res, next) => {
    try {
      const filter = await Filters.getFilter(req.user, req.params.id);
      return res.json({ success: true, filter });
    } catch (err) {
      return next(err);
    }
  })
  .put(async (req, res, next) => {
    try {
      await Filters.update(req.user, req.params.id, req.body);
      return res.json({ success: true, message: "Successfully updated the filter." });
    } catch (err) {
      return next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      await Filters.delete(req.user, req.params.id);
      return res.json({ success: true, message: "Successfully removed the filter." });
    } catch (err) {
      return next(err);
    }
  });

module.exports = filterRoute;
