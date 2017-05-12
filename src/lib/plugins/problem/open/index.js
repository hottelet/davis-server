"use strict";

const Dynatrace = require("../../../core/dynatrace");
const Plugin = require("../../../core/plugin");
const sb = require("../../../util/builder").sb;

/**
 * Plugin for asking about open issues
 *
 * @class OpenProblem
 * @extends {Plugin}
 */
class OpenProblem extends Plugin {
  /**
   * Creates an instance of OpenProblem.
   *
   *
   * @memberOf OpenProblem
   */
  constructor() {
    super(...arguments);
    this.name = "davisProblemOpen";
  }

  /**
   * Main plugin method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf OpenProblem
   */
  async ask(req) {
    if (req.slots.app) {
      return { text: "I'm sorry, I can't filter queries by application at the moment." };
    }
    const problems = await Dynatrace.problemFeed(req.user, { status: "OPEN" });
    const numProblems = problems.length;

    if (numProblems === 0) {
      return { text: "Nice! It appears your system has no open problems." };
    }

    const stats = Dynatrace.problemStats(problems);

    const numApps = Object.keys(stats.affectedApps).length;

    if (numProblems === 1) {
      if (numApps === 0) {
        return {
          text: "There is currently only one open issue that doesn't appear " +
          "to be affecting any applications.",
        };
      } else if (numApps === 1) {
        return {
          text: "There is currently only one open issue affecting one application.",
        };
      }
      return {
        text:
        sb(req.user).s("There is currently only one open issue, but it is affecting").s(numApps).s("applications."),
      };
    }

    return {
      text: sb(req.user)
        .s("There are currently").s(numProblems).s("open issues, affecting").s(numApps).s("applications."),
    };
  }
}

module.exports = OpenProblem;
