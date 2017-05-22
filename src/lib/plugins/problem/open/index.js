"use strict";

const Dynatrace = require("../../../core/dynatrace");
const Plugin = require("../../../core/plugin");
const sb = require("../../../util/builder").sb;
const Util = require("../../../util");
const support = require("./support");

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
    this.support = support;
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
    const problems = await Dynatrace.problemFeed(req.user, { status: "OPEN" });
    const numProblems = problems.length;


    return (numProblems === 0) ? { text: "Nice! It appears your system has no open problems." } :
      (numProblems === 1) ? oneProblem(req, problems[0]) :
      manyProblems(req, problems);
  }
}

async function oneProblem(req, problem) {
  const detail = await req.davis.plugins.davisProblemDetail._yes(req, problem.id);

  return {
    text: sb(req.user).s("There is currently only one open problem.").s(detail.text),
    show: {
      text: "There is currently only one open problem.",
      attachments: detail.attachments,
    },
    paging: {
      items: [{ id: problem.id, source: "davisProblemDetail", target: "davisProblemDetail" }],
      active: 0,
    },
  };
}

async function manyProblems(req, problems) {
  return {
    text: sb(req.user)
      .s("There are currently").s(problems.length).s("open problems.")
      .s(Util.Dynatrace.summarize(req.user, problems, false, true))
      .s("Would you like to see a listing of these issues?"),
    targets: {
      yes: {
        intent: "davisPagerShow",
      },
    },
    paging: {
      items: problems.map(p => ({ id: p.id, source: "davisProblemDetail", target: "davisProblemDetail" })),
    },
  };
}

module.exports = OpenProblem;
