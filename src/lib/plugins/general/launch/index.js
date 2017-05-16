"use strict";

const Plugin = require("../../../core/plugin");

const { sb } = require("../../../util/builder");

class Launch extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisGeneralLaunch";
  }

  async ask(req) {
    return {
      text: sb(req.user).s([
        "What's up?",
        "How can I be of service?",
        "What can I help you with?",
        "What can I do for you?",
        "How can I help you?",
      ]),
    };
  }
}

module.exports = Launch;
