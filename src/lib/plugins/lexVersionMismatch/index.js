"use strict";

const Plugin = require("../../core/plugin");
const sb = require("../../util/builder").sb;

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class LexVersionMismatch
 * @extends {Plugin}
 */
class LexVersionMismatch extends Plugin {
  /**
   * Creates an instance of LexVersionMismatch.
   *
   *
   * @memberOf LexVersionMismatch
   */
  constructor() {
    super(...arguments);
    this.name = "davisLexVersionMismatch";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf LexVersionMismatch
   */
  async ask(req) {
    return {
      text: sb(req.user).s("It seems you have stumbled on a feature currently under devlopment.")
        .s("Check back later for updates!"),
    };
  }
}

module.exports = LexVersionMismatch;
