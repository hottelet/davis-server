"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

class DateProblem extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisProblemRelTime";
  }

  static async ask(req) {
    const timeRange = Util.Date.relTimeParser(req.slots.relTime, req.user);
    const problems = await Dynatrace.problemFeed(req.user, { timeRange });
    return (problems.length === 0) ? noProblem(req) :
      (problems.length === 1) ? oneProblem(req, problems[0]) :
        manyProblems(req, problems);
  }
}

async function noProblem(req) {
  return { text: sb(req.user).s("Great! There were no problems").s(req.slots.relTime).s("!") };
}

async function oneProblem(req, problem) {
  const detail = await req.davis.plugins.davisProblemDetail._yes(req, problem.id);
  return {
    text: sb(req.user).s("Only one problem occurred").s(req.slots.relTime).p.s(detail.text),
    show: {
      text: sb(req.user).s("Only one problem occurred").s(req.slots.relTime).p,
      attachments: detail.show.attachments,
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
      .s(req.slots.relTime, null, null, true).c.s(problems.length)
      .s("problems occurred. Would you like to see a listing of these issues?"),
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

module.exports = DateProblem;
