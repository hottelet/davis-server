"use strict";

const Plugin = require("../../../core/plugin");

class NumericChoiceThree extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNumericThree";
  }

  async ask(req) {
    return this.davis.plugins.davisPagerRoute._choose(req, 2);
  }
}

module.exports = NumericChoiceThree;
