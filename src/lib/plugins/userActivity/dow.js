"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivityDow
 * @extends {Plugin}
 */
class UserActivityDow extends Plugin {
  /**
   * Creates an instance of UserActivityDow.
   *
   *
   * @memberOf UserActivityDow
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityDow";
  }

  parseSlots(user, slots) {
    slots.date = Util.SlotParsers.dow(slots.dow, user);
    return slots;
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivityDow
   */
  async ask(req) {
    const date = req.slots.date;
    const timeRange = Util.Date.dateParser(date, req.user);

    const ts = await Dynatrace.getUserActivity(req.user, { timeRange });
    const stats = Util.Dynatrace.userActivityStats(ts);

    return {
      text: sb(req.user).date(date).c.s("your most used application was").e(stats.topApp, ts.entities[stats.topApp]).c
        .s("which experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed."),
    };
  }
}

module.exports = UserActivityDow;
