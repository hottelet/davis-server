"use strict";

const Plugin = require("../../../core/plugin");

const { sb } = require("../../../util/builder");

class Thanks extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisGeneralThanks";
  }

  async ask(req) {
    return {
      text: sb(req.user).s([
        "You're quite welcome.",
        "You're welcome.",
        "Any time!",
        "No problem at all!",
        "No problem!",
      ]),
    };
  }
}

module.exports = Thanks;
