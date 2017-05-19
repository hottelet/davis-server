"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivityDate
 * @extends {Plugin}
 */
class UserActivityDate extends Plugin {
  /**
   * Creates an instance of UserActivityDate.
   *
   *
   * @memberOf UserActivityDate
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityDate";
  }

  parseSlots(user, slots, raw) {
    slots.date = Util.SlotParsers.relativeDate(slots.date, user, raw);
    return slots;
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivityDate
   */
  async ask(req) {
    const date = req.slots.date;
    const timeRange = Util.Date.dateParser(date, req.user);

    const ts = await Dynatrace.getUserActivity(req.user, { timeRange });
    const stats = Util.Dynatrace.userActivityStats(ts);

    return {
      text: sb(req.user).date(date, true).c.s("your most used application was").e(stats.topApp, ts.entities[stats.topApp]).c
        .s("which experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed."),
    };
  }
}

module.exports = UserActivityDate;
