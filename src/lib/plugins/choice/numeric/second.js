"use strict";

const Plugin = require("../../../core/plugin");

class NumericChoiceTwo extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNumericTwo";
  }

  async ask(req) {
    return this.davis.plugins.davisPagerRoute._choose(req, 1);
  }
}

module.exports = NumericChoiceTwo;
