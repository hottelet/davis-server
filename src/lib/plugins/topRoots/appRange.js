"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsAppRange
 * @extends {Plugin}
 */
class TopRootsAppRange extends Plugin {
  /**
   * Creates an instance of TopRootsAppRange.
   *
   *
   * @memberOf TopRootsAppRange
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsAppRange";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsAppRange
   */
  async ask(req) {
    const app = await Dynatrace.findApplicationBySoundalike(req.user, req.slots.app);
    if (!app) {
      return { text: `Could not find the application ${req.slots.app}.` };
    }

    let problems = await Dynatrace.problemFeed(req.user, { relativeTime: req.slots.range });
    problems = Util.Dynatrace.filterProblemFeed(problems, { entityId: app.entityId });

    if (problems.length === 0) {
      return {
        text: sb(req.user).s("Great! There were no problems detected in the last").d(req.slots.range)
          .s("which affected").e(app.entityId, app.name).p,
      };
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
      return {
        text: sb(req.user).s("Great! There were no problems with detected root causes in the last").d(req.slots.range)
          .s("which affected").e(app.entityId, app.name).p,
      };
    }

    return {
      text: sb(req.user)
        .s("There have been").s(roots.length).s("problems with root causes in the last")
        .d(req.slots.range).s("which affected").e(app.entityId, app.name).p
        .s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount)
        .s("issues.").s("The entity that caused the most problems was").e(topEntity, topEntityName)
        .c.s("which caused").s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRootsAppRange;
