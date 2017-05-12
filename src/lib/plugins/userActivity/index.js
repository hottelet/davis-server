"use strict";

const Plugin = require("../../core/plugin");
const sb = require("../../util/builder").sb;

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class UserActivity
 * @extends {Plugin}
 */
class UserActivity extends Plugin {
  /**
   * Creates an instance of UserActivity.
   *
   *
   * @memberOf UserActivity
   */
  constructor() {
    super(...arguments);
    this.name = "davisActivityUnimplemented";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf UserActivity
   */
  async ask(req) {
    return {
      text: sb(req.user).s("It seems you have stumbled on a feature currently under devlopment.")
        .s("Check back later for updates!"),
    };
  }
}

module.exports = UserActivity;
