"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsRange
 * @extends {Plugin}
 */
class TopRootsRange extends Plugin {
  /**
   * Creates an instance of TopRootsRange.
   *
   *
   * @memberOf TopRootsRange
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsRange";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsRange
   */
  async ask(req) {
    const problems = await Dynatrace.problemFeed(req.user, { relativeTime: req.slots.range });

    if (problems.length === 0) {
      return { text: sb(req.user).s("Great! There were no problems detected in the last").d(req.slots.range).p };
    }

    const {
      roots,
      topEvent,
      topEventCount,
      topEntityCount,
      topEntity,
      topEntityName,
    } = Util.Dynatrace.problemStats(problems);

    if (roots.length === 0) {
      return { text: sb(req.user).s("Great! There were no problems with detected root causes in the last").d(req.slots.range).p };
    }

    return {
      text: sb(req.user)
        .s("There have been").s(roots.length).s("problems with root causes in the last").d(req.slots.range).p
        .s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount)
        .s("issues.").s("The entity that caused the most problems was").e(topEntity, topEntityName)
        .c.s("which caused").s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRootsRange;
