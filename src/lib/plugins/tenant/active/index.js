"use strict";

const Plugin = require("../../../core/plugin");
const TenantController = require("../../../controllers/tenants");

const { sb } = require("../../../util/builder");
const support = require("./support");

class Active extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisTenantActive";
    this.support = support;
  }

  async ask(req) {
    const tenant = await TenantController.getById(req.user.tenant);


    return {
      text: sb(req.user).s([
        "You're using",
        "You are on",
        "I'm currently using",
        "I'm currently looking at",
      ]).s(tenant.name).s("!"),
    };
  }
}

module.exports = Active;
