"use strict";

const Plugin = require("../../../core/plugin");

class NumericChoiceOne extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNumericOne";
  }

  async ask(req) {
    return this.davis.plugins.davisPagerRoute._choose(req, 0);
  }
}

module.exports = NumericChoiceOne;
