"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsDate
 * @extends {Plugin}
 */
class TopRootsDate extends Plugin {
  /**
   * Creates an instance of TopRootsDate.
   *
   *
   * @memberOf TopRootsDate
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsDate";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsDate
   */
  async ask(req) {
    const timeRange = Util.Date.dateParser(req.slots.date, req.user);
    const problems = await Dynatrace.problemFeed(req.user, { timeRange });

    if (problems.length === 0) {
      return { text: sb(req.user).s("Great! There were no problems detected").date(req.slots.date).p };
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
      return { text: sb(req.user).s("Great! There were no problems with detected root causes").date(req.slots.date).p };
    }

    return {
      text: sb(req.user)
        .date(req.slots.date).s("there were").s(roots.length).s("problems with detected root causes").p
        .s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount)
        .s("issues.").s("The entity that caused the most problems was").e(topEntity, topEntityName)
        .c.s("which caused").s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRootsDate;
