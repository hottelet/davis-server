"use strict";

const _ = require("lodash");

const Plugin = require("../../../core/plugin");
const logger = require("../../../core/logger");

class No extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNo";
  }

  async ask(req) {
    logger.debug({ choice: { type: "boolean", choice: false } });
    const target = _.get(req, "context.targets.no.intent");
    // TODO expand this workflow
    if (!target) {
      return {
        text: "I'm sorry, but I'm not sure what you mean.",
      };
    }
    return this.davis.plugins[target]._no(req, req.context.targets.no.value);
  }
}

module.exports = No;
