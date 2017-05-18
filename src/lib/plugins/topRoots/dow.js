"use strict";

const Plugin = require("../../core/plugin");
const Util = require("../../util");

/**
 * Discover problematic root cause entities and event types
 *
 * @class TopRootsDow
 * @extends {Plugin}
 */
class TopRootsDow extends Plugin {
  /**
   * Creates an instance of TopRootsDow.
   *
   *
   * @memberOf TopRootsDow
   */
  constructor() {
    super(...arguments);
    this.name = "davisTopRootsDow";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf TopRootsDow
   */
  async ask(req) {
    req.slots.date = Util.SlotParsers.dow(req.slots.dow, req.user);
    return this.davis.plugins.davisTopRootsDate.ask(req);
  }
}

module.exports = TopRootsDow;
