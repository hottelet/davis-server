"use strict";

const support = require("../support");

support.examples.push(
  [
    {
      request: {
        text: "open",
        slotTypeValues: {
          NUMBER: "first",
        },
      },
    },
  ] // eslint-disable-line comma-dangle
);
module.exports = support;
