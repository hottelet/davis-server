"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsApp
 * @extends {Plugin}
 */
class TopRootsApp extends Plugin {
  /**
   * Creates an instance of TopRootsApp.
   *
   *
   * @memberOf TopRootsApp
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsApp";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsApp
   */
  async ask(req) {
    const app = await Dynatrace.findApplicationBySoundalike(req.user, req.slots.app);
    if (!app) {
      return { text: `Could not find the application ${req.slots.app}.` };
    }
    const problems = await Dynatrace.problemFeed(req.user, { relativeTime: "month", entity: app.entityId });

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
        .s("There have been").s(roots.length).s("problems with root causes that affected").e(app.entityId, app.name)
        .s("in the last month.").s("The most common root cause was").h(topEvent).c.s("which caused").s(topEventCount)
        .s("issues.").s("The entity that caused the most problems was").e(topEntity, topEntityName).c.s("which caused")
        .s(topEntityCount).s("issues."),
    };
  }
}

module.exports = TopRootsApp;
