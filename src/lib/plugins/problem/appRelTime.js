"use strict";

const Plugin = require("../../core/plugin");
const Dynatrace = require("../../core/dynatrace");
const sb = require("../../util/builder").sb;
const Util = require("../../util");

class ProblemAppRelTime extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisProblemAppRelTime";
  }

  async ask(req) {
    const app = await Dynatrace.findApplicationBySoundalike(req.user, req.slots.app);
    if (!app) {
      return { text: `Could not find the application ${req.slots.app}.` };
    }
    const timeRange = Util.Date.relTimeParser(req.slots.relTime, req.user);

    let problems = await Dynatrace.problemFeed(req.user, { timeRange });
    problems = Util.Dynatrace.filterProblemFeed(problems, { entityId: app.entityId });

    return (problems.length === 0) ? noProblem(req, app) :
      (problems.length === 1) ? oneProblem(req, problems[0], app) :
        manyProblems(req, problems, app);
  }
}

async function noProblem(req, app) {
  return { text: sb(req.user).s("Great! There were no problems that affected").e(app.entityId, app.name).s(req.slots.relTime).s("!") };
}

async function oneProblem(req, problem, app) {
  const detail = await req.davis.plugins.davisProblemDetail._yes(req, problem.id);
  return {
    text: sb(req.user).s("Only one problem affected").e(app.entityId, app.name).s(req.slots.relTime).p.s(detail.text),
    show: {
      text: sb(req.user).s("Only one problem affected").e(app.entityId, app.name).s(req.slots.relTime).p,
      attachments: detail.show.attachments,
    },
    paging: {
      items: [{ id: problem.id, source: "davisProblemDetail", target: "davisProblemDetail" }],
      active: 0,
    },
  };
}

async function manyProblems(req, problems, app) {
  return {
    text: sb(req.user)
      .s(req.slots.relTime, null, null, true).c.s(problems.length)
      .s("problems affected").e(app.entityId, app.name).p.s("Would you like to see a listing of these issues?"),
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

module.exports = ProblemAppRelTime;
