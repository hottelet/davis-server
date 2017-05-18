"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsAppRelTime
 * @extends {Plugin}
 */
class TopRootsAppRelTime extends Plugin {
  /**
   * Creates an instance of TopRootsAppRelTime.
   *
   *
   * @memberOf TopRootsAppRelTime
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsAppRelTime";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsAppRelTime
   */
  async ask(req) {
    const app = await Dynatrace.findApplicationBySoundalike(req.user, req.slots.app);
    if (!app) {
      return { text: "I'm sorry, but I couldn't find that application." };
    }

    const timeRange = Util.Date.relTimeParser(req.slots.relTime, req.user);
    let problems = await Dynatrace.problemFeed(req.user, { timeRange });
    problems = Util.Dynatrace.filterProblemFeed(problems, { entity: app.entityId });

    if (problems.length === 0) {
      return {
        text: sb(req.user).s("Great! There were no problems detected").s(req.slots.relTime)
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
        text: sb(req.user).s("Great! There were no problems with detected root causes").s(req.slots.relTime)
          .s("which affected").e(app.entityId, app.name).p,
      };
    }

    return {
      text: sb(req.user)
        .s(req.slots.relTime, null, null, true).s("there were").s(roots.length)
        .s("problems with detected root causes which affected").e(app.entityId, app.name).p
        .s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount)
        .s("issues.").s("The entity that caused the most problems was").e(topEntity, topEntityName)
        .c.s("which caused").s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRootsAppRelTime;
