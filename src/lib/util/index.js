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

module.exports.linearRegression = (ys, xs) => {
  const lr = {};
  const n = ys.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  ys.forEach((v, i) => {
    const x = xs[i];
    const y = ys[i];

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  });

  lr.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); // eslint-disable-line
  lr.intercept = (sumY - lr.slope * sumX) / n; // eslint-disable-line
  lr.r2 = ((n*sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))) ** 2; // eslint-disable-line
  return lr;
};

module.exports.Linker = Linker;
