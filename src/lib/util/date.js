"use strict";

const moment = require("moment");
const relTimeParsers = require("./relTime");
require("moment-precise-range-plugin");

/**
 * Date utility class
 *
 * @class DDate
 */
class DDate {
  /**
   *
   *
   * @static
   * @param {moment.Moment} start
   * @param {moment.Moment} end
   * @returns
   *
   * @memberOf DDate
   */
  static preciseDiff(start, end) {
    return moment.preciseDiff(start, end).replace(/^1 /, "");
  }

  /**
   * Parse a Lex AMAZON.Date slot into a time range
   *
   * @static
   * @param {(string | undefined)} date
   * @param {IUserModel} user
   * @returns {({ startTime: number, endTime: number, grain: string } | null)}
   *
   * @memberOf DDate
   */
  static dateParser(date, user) {
    if (!date) {
      return null;
    }
    // day
    // 2017-04-25
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const grain = "day";
      if (moment.tz(date, user.timezone).isAfter(moment())) {
        // this is in the future
        return {
          startTime: moment.tz(date, user.timezone).subtract(1, "year").valueOf(),
          endTime: moment.tz(date, user.timezone).subtract(1, "year").endOf("day").valueOf(),
          grain,
        };
      }

      return {
        startTime: moment.tz(date, user.timezone).valueOf(),
        endTime: moment.tz(date, user.timezone).endOf("day").valueOf(),
        grain,
      };
    }

    // day of week
    if (/sunday|monday|tuesday|wednesday|thursday|friday|saturday/.test(date.toLowerCase())) {
      const grain = "day";
      return {
        startTime: moment.tz(user.timezone).day(date).subtract(1, "week").valueOf(),
        endTime: moment.tz(user.timezone).day(date).subtract(1, "week").endOf("day").valueOf(),
        grain,
      };
    }

    // week
    // 2017-W23
    if (/^\d{4}-W\d{2}$/.test(date)) {
      const grain = "week";
      return {
        startTime: moment.tz(date, user.timezone).valueOf(),
        endTime: moment.tz(date, user.timezone).endOf("week").valueOf(),
        grain,
      };
    }

    // month
    // 2017-02
    if (/^\d{4}-W\d{2}$/.test(date)) {
      const grain = "month";
      if (moment.tz(date, user.timezone).isAfter(moment())) {
        // this is in the future
        return {
          startTime: moment.tz(date, user.timezone).subtract(1, "year").valueOf(),
          endTime: moment.tz(date, user.timezone).subtract(1, "year").endOf("month").valueOf(),
          grain,
        };
      }

      return {
        startTime: moment.tz(date, user.timezone).valueOf(),
        endTime: moment.tz(date, user.timezone).endOf("month").valueOf(),
        grain,
      };
    }

    // year
    // 2017
    if (/^\d{4}$/.test(date)) {
      const grain = "year";
      return {
        startTime: moment.tz(date, user.timezone).valueOf(),
        endTime: moment.tz(date, user.timezone).endOf("year").valueOf(),
        grain,
      };
    }

    return { startTime: 0, endTime: 0, grain: "error" };
  }

  static relTimeParser(relTime, user) {
    const parser = relTimeParsers[relTime.toLowerCase()];
    if (parser) {
      return parser(user.timezone);
    }
    return null;
  }
}

module.exports = DDate;
