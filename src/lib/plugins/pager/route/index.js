"use strict";

const Plugin = require("../../../core/plugin");

class PageRoute extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisPagerRoute";
  }

  async yes(req, value) {
    if (!value || !value.target) {
      return { text: "I'm sorry, but I can't answer that right now." };
    }
    return this.davis.plugins[value.target]._yes(req, value.id);
  }

  async no(req, value) {
    if (!value || !value.target) {
      return { text: "I'm sorry, but I can't answer that right now." };
    }
    return this.davis.plugins[value.target]._no(req, value.id);
  }
}

module.exports = PageRoute;
