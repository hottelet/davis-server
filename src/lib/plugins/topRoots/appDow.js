"use strict";

const Plugin = require("../../core/plugin");
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsAppDow
 * @extends {Plugin}
 */
class TopRootsAppDow extends Plugin {
  /**
   * Creates an instance of TopRootsAppDow.
   *
   *
   * @memberOf TopRootsAppDow
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsAppDow";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsAppDow
   */
  async ask(req) {
    req.slots.date = Util.SlotParsers.dow(req.slots.dow, req.user);
    return this.davis.plugins.davisTopRootsAppDate.ask(req);
  }
}

module.exports = TopRootsAppDow;
