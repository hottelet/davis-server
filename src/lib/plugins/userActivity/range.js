"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");
const _ = require("lodash");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivityRange
 * @extends {Plugin}
 */
class UserActivityRange extends Plugin {
  /**
   * Creates an instance of UserActivityRange.
   *
   *
   * @memberOf UserActivityRange
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityRange";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivityRange
   */
  async ask(req) {
    const range = req.slots.range;

    const ts = await Dynatrace.getUserActivity(req.user, { relativeTime: range });
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
      text: sb(req.user).s("In the last").duration(range).c.s("your most used application was").e(stats.topApp, ts.entities[stats.topApp]).c
        .s("which experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed.")
        .s("In the next 30 minutes, you can expect load to").s(expectation).s("around").s(predictionAverage).s("user actions per minute").p,
    };
  }
}

module.exports = UserActivityRange;
