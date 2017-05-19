"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivityAppDow
 * @extends {Plugin}
 */
class UserActivityAppDow extends Plugin {
  /**
   * Creates an instance of UserActivityAppDow.
   *
   *
   * @memberOf UserActivityAppDow
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityAppDow";
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
   * @memberOf UserActivityAppDow
   */
  async ask(req) {
    const app = req.slots.app;
    const entity = await Dynatrace.findApplicationBySoundalike(req.user, app);
    const date = req.slots.date;
    const timeRange = Util.Date.dateParser(date, req.user);

    const ts = await Dynatrace.getUserActivity(req.user, { timeRange, entity: entity.entityId });
    const stats = Util.Dynatrace.userActivityStats(ts);

    return {
      text: sb(req.user).date(date, true).c.e(stats.topApp, ts.entities[stats.topApp]).c
        .s("experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed."),
    };
  }
}

module.exports = UserActivityAppDow;
