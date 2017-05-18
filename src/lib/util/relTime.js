const moment = require("moment-timezone");

module.exports = {
  today: timezone => ({
    startTime: moment.tz(timezone).startOf("day").valueOf(),
    endTime: moment.tz(timezone).endOf("day").valueOf(),
    grain: "day",
  }),
  yesterday: timezone => ({
    startTime: moment.tz(timezone).subtract(1, "day").startOf("day").valueOf(),
    endTime: moment.tz(timezone).subtract(1, "day").endOf("day").valueOf(),
    grain: "day",
  }),

  "this evening": timezone => ({
    startTime: moment.tz(timezone).hour(17).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).hour(22).startOf("hour").valueOf(),
    grain: "relative",
  }),
  "yesterday evening": timezone => ({
    startTime: moment.tz(timezone).subtract(1, "day").hour(17).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).subtract(1, "day").hour(22).startOf("hour").valueOf(),
    grain: "relative",
  }),

  "this afternoon": timezone => ({
    startTime: moment.tz(timezone).hour(12).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).hour(17).startOf("hour").valueOf(),
    grain: "relative",
  }),
  "yesterday afternoon": timezone => ({
    startTime: moment.tz(timezone).subtract(1, "day").hour(12).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).subtract(1, "day").hour(17).startOf("hour").valueOf(),
    grain: "relative",
  }),

  "this morning": timezone => ({
    startTime: moment.tz(timezone).hour(0).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).hour(12).startOf("hour").valueOf(),
    grain: "relative",
  }),
  "yesterday morning": timezone => ({
    startTime: moment.tz(timezone).subtract(1, "day").hour(0).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).subtract(1, "day").hour(12).startOf("hour").valueOf(),
    grain: "relative",
  }),

  tonight: timezone => ({
    startTime: moment.tz(timezone).hour(17).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).endOf("day").valueOf(),
    grain: "relative",
  }),
  "last night": timezone => ({
    startTime: moment.tz(timezone).subtract(1, "day").hour(17).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).subtract(1, "day").endOf("day").valueOf(),
    grain: "relative",
  }),

  "over the weekend": timezone => ({
    startTime: moment.tz(timezone).subtract(1, "week").day("friday").hour(17).startOf("hour").valueOf(),
    endTime: moment.tz(timezone).day("monday").hour(8).startOf("hour").valueOf(),
    grain: "relative",
  }),
};
