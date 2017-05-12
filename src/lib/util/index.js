"use strict";

const DDate = require("./date");
const Linker = require("./linker");
const SlotParsers = require("./slot-parsers");
const Dynatrace = require("./dynatrace");

module.exports.Date = DDate;
module.exports.SlotParsers = SlotParsers;
module.exports.Dynatrace = Dynatrace;

module.exports.timer = () => {
  const start = process.hrtime();
  return function () {
    const end = process.hrtime();
    const startms = start[0] * 1000000 + start[1] / 1000; // eslint-disable-line
    const endms = end[0] * 1000000 + end[1] / 1000; // eslint-disable-line
    return ((endms - startms) / 1000).toFixed();
  };
};

module.exports.Linker = Linker;
