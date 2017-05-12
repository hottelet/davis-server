"use strict";

const Plugin = require("../../../core/plugin");
const Dynatrace = require("../../../core/dynatrace");
const sb = require("../../../util/builder").sb;
const Util = require("../../../util");

class DateProblem extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisProblemDate";
  }

  parseSlots(user, slots, raw) {
    if (slots.dow) {
      // Convert day of week into date slot for use by plugin

      slots.date = Util.SlotParsers.dow(slots.dow, user);
    } else if (!slots.date && slots.app) {
      // This is a lex workaround because if you say "what happened to madison island yesterday"
      // Lex thinks the app is "madison island yesterday" and the date is null

      const { app, date } = Util.SlotParsers.appDate(slots.app, slots.date, slots.user);

      slots.app = app;
      slots.date = date;
    } else if (slots.date && /yesterday|today|tomorrow/i.test(raw)) {
      // This is a workaround because lex processes all relative times as if they
      // were in the US Eastern timezone where lex resides

      slots.date = Util.SlotParsers.relativeDate(slots.date, user, raw);
    }
    return slots;
  }

  async ask(req) {
    if (req.slots.app) {
      const entity = await Dynatrace.findApplicationBySoundalike(req.user, req.slots.app);
      if (!entity) {
        return { text: `I'm sorry, I couldn't find the application ${req.slots.app}` };
      }
      return appResponse(req, entity);
    }

    return response(req);
  }
}

async function response(req) {
  const timeRange = Util.Date.dateParser(req.slots.date, req.user);
  const problems = await Dynatrace.problemFeed(req.user, { timeRange });
  return (problems.length === 0) ? noProblem(req) :
    (problems.length === 1) ? oneProblem(req, problems[0]) :
      manyProblems(req, problems);
}

async function appResponse(req, entity) {
  const timeRange = Util.Date.dateParser(req.slots.date, req.user);
  const unfiltered = await Dynatrace.problemFeed(req.user, { timeRange });
  const problems = Util.Dynatrace.filterProblemFeed(unfiltered, { entityId: entity.entityId });
  return (problems.length === 0) ? appNoProblem(req, entity) :
    (problems.length === 1) ? appOneProblem(req, problems[0], entity) :
      appManyProblems(req, problems, entity);
}

async function noProblem(req) {
  return { text: sb(req.user).s("Great! No problems affected").date(req.slots.date).s("!") };
}

async function appNoProblem(req, entity) {
  return {
    text: sb(req.user).s("Great! No problems affected").e(entity.entityId, entity.name)
      .date(req.slots.date).s("!"),
  };
}

async function oneProblem(req, problem) {
  const detail = await req.davis.plugins.davisProblemDetail._yes(req, problem.id);
  return {
    text: sb(req.user).s("Only one problem occurred").date(req.slots.date).p.s(detail.text),
    show: {
      text: sb(req.user).s("Only one problem occurred").date(req.slots.date).p,
      attachments: detail.show.attachments,
    },
  };
}

async function appOneProblem(req, problem, entity) {
  const detail = await req.davis.plugins.davisProblemDetail._yes(req, problem.id);
  return {
    text: sb(req.user).s("Only one problem occurred").date(req.slots.date).s("that affected")
      .e(entity.entityId, entity.name).p.s(detail.text),
    show: {
      text: sb(req.user).s("Only one problem occurred").date(req.slots.date).s("that affected")
        .e(entity.entityId, entity.name).p,
      attachments: detail.show.attachments,
    },
  };
}

async function manyProblems(req, problems) {
  return {
    text: sb(req.user)
      .date(req.slots.date).s(problems.length)
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

async function appManyProblems(req, problems, entity) {
  return {
    text: sb(req.user)
      .date(req.slots.date).s(problems.length)
      .s("problems affected").e(entity.entityId, entity.name).p.s("Would you like to see a listing of these issues?"),
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
