"use strict";

const Plugin = require("../../../core/plugin");
const logger = require("../../../core/logger");

class No extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNo";
  }

  async ask(req) {
    logger.debug({ choice: { type: "boolean", choice: false } });
    const target = req.context.targets.no.intent;
    if (!target) {
      return {
        text: "I'm sorry, but I'm not sure what you mean.",
      };
    }
    return this.davis.plugins[target]._no(req, req.context.targets.no.value);
  }
}

module.exports = No;
