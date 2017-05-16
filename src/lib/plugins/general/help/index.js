"use strict";

const Plugin = require("../../../core/plugin");

const { sb } = require("../../../util/builder");

class Help extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisGeneralHelp";
  }

  async ask(req) {
    // TODO Make this useful!
    return {
      text: sb(req.user).s([
        "I'm helping...",
      ]),
    };
  }
}

module.exports = Help;
