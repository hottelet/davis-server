"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");
const _ = require("lodash");

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivity
 * @extends {Plugin}
 */
class UserActivityAppRange extends Plugin {
  /**
   * Creates an instance of UserActivityAppRange.
   *
   *
   * @memberOf UserActivityAppRange
   */
  constructor() {
    super(...arguments);
    this.name = "davisUserActivityAppRange";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivityAppRange
   */
  async ask(req) {
    const range = req.slots.range;
    const app = req.slots.app;

    const entity = await Dynatrace.findApplicationBySoundalike(req.user, app);
    const ts = await Dynatrace.getUserActivity(req.user, { entity: entity.entityId, relativeTime: "day" });
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
      text: sb(req.user).s("In the last").duration(range).c.e(stats.topApp, ts.entities[stats.topApp]).c
        .s("experienced an average of").s(stats.topAppMean).s("user actions per minute. The highest load was around")
        .ts(stats.topAppMax[0]).s("when a load of").s(stats.topAppMax[1]).s("user actions per minute was observed.")
        .s("In the next 30 minutes, you can expect load to").s(expectation).s("around").s(predictionAverage).s("actions per minute").p,
    };
  }
}

module.exports = UserActivityAppRange;
