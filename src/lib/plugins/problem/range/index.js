"use strict";

const Dynatrace = require("../../../core/dynatrace");
const Plugin = require("../../../core/plugin");
const sb = require("../../../util/builder").sb;
const Util = require("../../../util");

const Linker = Util.Linker;

/**
 * Plugin for asking about a recent range
 *
 * "What happened in the last {range}"
 *
 * @class RangeProblem
 * @extends {Plugin}
 */
class RangeProblem extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisProblemRange";
  }

  /**
   * Main plugin method
   *
   * @param {IDavisRequest} req
   * @returns {IDavisResponse}
   *
   * @memberOf RangeProblem
   */
  async ask(req) {
    const range = req.slots.range;
    const app = req.slots.app;

    if (app) {
      return appResponse(req);
    }
    const problems = await Dynatrace.problemFeed(req.user, { relativeTime: range });

    return (problems.length === 0) ? noProblems(req.user, range) :
      (problems.length === 1) ? oneProblem(req.user, range, problems[0]) :
        manyProblems(req.user, range, problems);
  }
}
async function appResponse(req) {
  const range = req.slots.range;
  const app = req.slots.app;

  const entity = await Dynatrace.findApplicationBySoundalike(req.user, app);

  if (entity) {
    let problems = await Dynatrace.problemFeed(req.user, { relativeTime: range });

    problems = Util.Dynatrace.filterProblemFeed(problems, { entityId: entity.entityId });

    return (problems.length === 0) ? appNoProblems(req.user, range, entity) :
      (problems.length === 1) ? appOneProblem(req.user, range, problems[0], entity) :
        appManyProblems(req.user, range, problems, entity);
  }
  return { text: `I'm sorry, I can't find the app "${app}".` };
}

/**
 * No problems in the range
 *
 * @param {IUserModel} user
 * @param {string} range
 * @returns
 */
function noProblems(user, range) {
  return { text: sb(user).s("Nice! There were no problems").link(Linker.duration(user, range), sb(user).s("in the last").d(range).p) };
}

function appNoProblems(user, range, entity) {
  return { text: sb(user).s("Nice! There were no problems that affected").e(entity.entityId, entity.name).link(Linker.duration(user, range), sb(user).s("in the last").d(range).p) };
}

/**
 * One problem in the range
 *
 * @param {IUserModel} user
 * @param {string} range
 * @param {IProblem} problem
 * @returns
 */
async function oneProblem(user, range, problem) {
  const out = await ((problem.status === "OPEN") ? openProblem(user, range, problem) : closedProblem(user, range, problem));
  out.paging = {
    items: [{ id: problem.id, source: "davisProblemDetail", target: "davisProblemDetail" }],
    active: 0,
  };
  return out;
}

async function appOneProblem(user, range, problem, entity) {
  const out = await ((problem.status === "OPEN") ? appOpenProblem(user, range, problem, entity) : appClosedProblem(user, range, problem, entity));
  out.paging = {
    items: [{ id: problem.id, source: "davisProblemDetail", target: "davisProblemDetail" }],
    active: 0,
  };
  return out;
}

/**
 * One open problem in the range
 *
 * @param {IUserModel} user
 * @param {string} range
 * @param {IProblem} problem
 * @returns
 */
function openProblem(user, range, problem) {
  const stats = Util.Dynatrace.problemStats([problem]);
  const out = sb(user)
    .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s("the only problem was a").h(problem.rankedImpacts[0].eventType)
    .s("that started at").ts(problem.startTime).c.s("and is still ongoing.");

  const apps = stats.affectedEntities.APPLICATION || [];
  const appIds = Object.keys(apps);

  return {
    text: (appIds.length === 0) ? out.s("No applications are being affected.") :
      (appIds.length === 1) ? out.s("The only affected application is").e(appIds[0], apps[appIds[0]]) :
        out.e(appIds[0], apps[appIds[0]]).s("and").s(appIds.length - 1).s("other applications are being affected."),
  };
}

function appOpenProblem(user, range, problem, entity) {
  const stats = Util.Dynatrace.problemStats([problem]);
  const out = sb(user)
    .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s("the only problem that affected").e(entity.entityId, entity.name).s("was a").h(problem.rankedImpacts[0].eventType)
    .s("that started at").ts(problem.startTime).c.s("and is still ongoing.");

  const apps = stats.affectedEntities.APPLICATION || [];
  const appIds = Object.keys(apps);

  return {
    text: (appIds.length < 2) ? out.s("No other applications are being affected.") :
        out.s(appIds.length - 1).s("other applications are being affected."),
  };
}

/**
 * One closed problem in the range
 *
 * @param {IUserModel} user
 * @param {string} range
 * @param {IProblem} problem
 * @returns
 */
function closedProblem(user, range, problem) {
  const stats = Util.Dynatrace.problemStats([problem]);

  // Always starts the same way
  const out = sb(user)
    .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s("the only problem was a").h(problem.rankedImpacts[0].eventType)
    .s("that started").ts(problem.startTime).c.s("and ended").ts(problem.endTime).p;

  const apps = stats.affectedEntities.APPLICATION || [];
  const appIds = Object.keys(apps);
  const count = appIds.length;
  const others = count - 1;

  // Two possible cases
  const oneAffected = sb(user).s("The only affected application was").e(appIds[0], apps[appIds[0]]).p;
  const moreAffected = sb(user).e(appIds[0], apps[appIds[0]]).s("and").s(others).s("other")
    .s(["application was affected", "application had issues"], "applications were affected", others).p;

  return {
    text: (count === 0) ? out.s("No applications were affected.") :
      (count === 1) ? out.s(oneAffected) :
        out.s(moreAffected),
  };
}

function appClosedProblem(user, range, problem, entity) {
  const stats = Util.Dynatrace.problemStats([problem]);

  // Always starts the same way
  const out = sb(user)
    .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s("the only problem that affected").e(entity.entityId, entity.name).s("was a").h(problem.rankedImpacts[0].eventType)
    .s("that started").ts(problem.startTime).c.s("and ended").ts(problem.endTime).p;

  const apps = stats.affectedEntities.APPLICATION || [];
  const appIds = Object.keys(apps);

  return {
    text: (appIds.length < 2) ? out.s("No other applications were affected.") :
        out.s(appIds.length - 1).s("other applications were affected."),
  };
}

/**
 * More than one problem in the range
 *
 * @param {IUserModel} user
 * @param {string} range
 * @param {IProblem[]} problems
 * @returns
 */
function manyProblems(user, range, problems) {
  return {
    text: sb(user)
      .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s(problems.length)
      .s("problems occurred.").s(Util.Dynatrace.summarize(user, problems)).s("Would you like to see a listing of these issues?"),
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

function appManyProblems(user, range, problems, entity) {
  return {
    text: sb(user)
      .link(Linker.duration(user, range), sb(user).s("In the last").d(range)).c.s(problems.length)
      .s("problems affected").e(entity.entityId, entity.name).p.s(Util.Dynatrace.summarize(user, problems, true)).s("Would you like to see a listing of these issues?"),
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

module.exports = RangeProblem;
