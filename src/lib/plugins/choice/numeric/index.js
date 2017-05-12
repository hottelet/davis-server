"use strict";

const Plugin = require("../../../core/plugin");
const logger = require("../../../core/logger");

const choices = {
  first: 0,
  "1st": 0,
  one: 0,
  1: 0,
  second: 1,
  "2nd": 1,
  two: 1,
  2: 1,
  third: 2,
  "3rd": 2,
  3: 2,
};

class NumericChoice extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisChoiceNumeric";
  }

  async ask(req) {
    const choice = (req.slots.ord || req.slots.num).toLowerCase();
    const idx = choices[choice];
    logger.debug({ choice: { type: "numeric", choice, idx } });
    if (idx === undefined) {
      return {
        text: "I'm sorry, but I'm not sure what you mean.",
      };
    }
    return this.davis.plugins.pageRoute._choose(req, idx);
  }
}

module.exports = NumericChoice;
