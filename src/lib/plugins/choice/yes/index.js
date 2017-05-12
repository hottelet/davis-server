"use strict";

const Plugin = require("../../../core/plugin");
const logger = require("../../../core/logger");

class Yes extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceYes";
  }

  async ask(req) {
    logger.debug({ choice: { type: "boolean", choice: true } });
    const target = req.context.targets.yes.intent;
    const value = req.context.targets.yes.value;
    if (!target) {
      return {
        text: "I'm sorry, but I'm not sure what you mean.",
      };
    }
    return this.davis.plugins[target]._yes(req, value);
  }
}

module.exports = Yes;
