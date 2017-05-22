"use strict";

const tenantRoute = require("express").Router();
const _ = require("lodash");

const TenantController = require("../../../controllers/tenants");

tenantRoute.route("/tenant")
  /**
   * Returns the active tenant for the user
   */
  .get(async (req, res, next) => {
    try {
      // TODO remove sensitive data from non-admin view
      return res.json({ success: true, tenant: req.user.tenant });
    } catch (err) {
      return next(err);
    }
  })
  /**
   * Creates a new tenant
   */
  .post(async (req, res, next) => {
    try {
      const tenant = req.body;
      await TenantController.create(req.user, tenant);
      return res.status(201).json({ success: true, message: "Tenant successfully added!" });
    } catch (err) {
      return next(err);
    }
  });

/**
 * Lists all the tenants the user is eligible to use
 */
tenantRoute.get("/tenants", async (req, res, next) => {
  try {
    const tenants = await TenantController.getAll(req.user);
    const active = _.findIndex(tenants, t => t._id.equals(req.user.tenant._id));
    return res.json({ success: true, active, tenants });
  } catch (err) {
    return next(err);
  }
});

tenantRoute.put("/tenant/:id(([0-9a-f]{24}))/active", async (req, res, next) => {
  try {
    await TenantController.changeActiveTenant(req.user, req.params.id);
    return res.json({ success: true, message: "Your active tenant has been changed." });
  } catch (err) {
    return next(err);
  }
});

tenantRoute.route("/tenant/:id(([0-9a-f]{24}))")
  /**
   * Gets a tenant by ID
   */
  .get(async (req, res, next) => {
    try {
      const tenant = await TenantController.getById(req.params.id);
      // TODO remove sensitive data from non-admin view
      return res.json({ success: true, tenant });
    } catch (err) {
      return next(err);
    }
  })
  /**
   * Updates a tenant
   */
  .put(async (req, res, next) => {
    try {
      await TenantController.update(req.user, req.params.id, req.body);
      return res.json({ success: true, message: "Tenant successfully updated!" });
    } catch (err) {
      return next(err);
    }
  })
  /**
   * Deletes a tenant
   */
  .delete(async (req, res, next) => {
    try {
      await TenantController.delete(req.user, req.params.id);
      return res.json({ success: true, message: "Tenant successfully deleted!" });
    } catch (err) {
      return next(err);
    }
  });

module.exports = tenantRoute;
