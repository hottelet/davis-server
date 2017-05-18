"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRoots
 * @extends {Plugin}
 */
class TopRoots extends Plugin {
  /**
   * Creates an instance of TopRoots.
   *
   *
   * @memberOf TopRoots
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRoots";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRoots
   */
  async ask(req) {
    const problems = await Dynatrace.problemFeed(req.user, { relativeTime: "month" });

    const {
      roots,
      topEvent,
      topEventCount,
      topEntityCount,
      topEntity,
      topEntityName,
    } = Util.Dynatrace.problemStats(problems);

    return {
      text: sb(req.user)
        .s("There have been").s(roots.length).s("problems with root causes in the last month.")
        .s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount).s("issues.")
        .s("The entity that caused the most problems was").e(topEntity, topEntityName).c.s("which caused")
        .s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRoots;
