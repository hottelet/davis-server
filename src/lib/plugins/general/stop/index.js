"use strict";

const Plugin = require("../../../core/plugin");

const { sb } = require("../../../util/builder");

class Stop extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisGeneralStop";
  }

  async ask(req) {
    return {
      text: sb(req.user).s([
        "Okay, have a good one.",
        "Talk to you later.",
        "See you later.",
        "Have a nice day.",
      ]),
      stop: true,
    };
  }
}

module.exports = Stop;
