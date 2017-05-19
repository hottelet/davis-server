"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");
const _ = require("lodash");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivityRelTime
 * @extends {Plugin}
 */
class UserActivityRelTime extends Plugin {
  /**
   * Creates an instance of UserActivityRelTime.
   *
   *
   * @memberOf UserActivityRelTime
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityRelTime";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivityRelTime
   */
  async ask(req) {
    const timeRange = Util.Date.relTimeParser(req.slots.relTime, req.user);

    const ts = await Dynatrace.getUserActivity(req.user, { timeRange });
    const stats = Util.Dynatrace.userActivityStats(ts);
    const prediction = await Dynatrace.predictUserActivity(req.user, stats.topApp);
    const predictionPoints = prediction.dataPoints[stats.topApp];

    const ys = predictionPoints.map(point => point[1]);
    const xs = predictionPoints.map(point => point[0] / prediction.resolutionInMillisUTC);

    const lr = Util.linearRegression(ys, xs);
    const expectation = (lr.slope < -0.5) ? "decrease to" :
      (lr.slope > 0.5) ? "increase to" :
      "stay";
    const predictionAverage = Math.floor(_.mean(ys.slice(3)));

    return {
      text: sb(req.user).s(req.slots.relTime, null, null, true).c.s("your most used application was").e(stats.topApp, ts.entities[stats.topApp]).c
        .s("which experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed.")
        .s("In the next 30 minutes, you can expect load to").s(expectation).s("around").s(predictionAverage).s("user actions per minute").p,
    };
  }
}

module.exports = UserActivityRelTime;
