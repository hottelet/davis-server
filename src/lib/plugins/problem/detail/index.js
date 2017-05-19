"use strict";

const Plugin = require("../../../core/plugin");
const { cb, sb } = require("../../../util/builder");
const Dynatrace = require("../../../core/dynatrace");
const Util = require("../../../util");

class DetailProblem extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisProblemDetail";
  }

  /**
   * Choice handler
   *
   * @param {IDavisRequest} req
   * @param {Number} choice
   * @returns {IDavisResponse}
   *
   * @memberOf DetailProblem
   */
  async yes(req, pid) {
    const detail = await Dynatrace.problemDetails(req.user, pid);
    const stats = Util.Dynatrace.detailStats(detail);

    const summary = getSummary(req, detail);
    const cards = stats.eventTypes.map(etype => eventHandler(req, etype, stats));

    const text = (stats.open) ? openProblem(req, detail, stats) : closedProblem(req, detail, stats);

    cards.unshift(summary);

    return {
      text,
      show: {
        text: "Below are the problem details you requested",
        attachments: cards,
      },
    };
  }

  async listItem(req, id) {
    const details = await Dynatrace.problemDetails(req.user, id);

    const last = details.rankedEvents.length - 1;
    const text = sb(req.user)
      .h(details.rankedEvents[last].eventType)
      .s("on").e(details.rankedEvents[last].entityId, details.rankedEvents[last].entityName);

    return {
      text,
      value: details,
    };
  }


}

function getSummary(req, detail) {
  return cb(req.user)
    .color(detail.status)
    .title(problemTitle(req.user, detail))
    .url(Util.Linker.problem(req.user, detail.id))
    .field("Time Frame", sb(req.user).tr(detail.startTime, detail.endTime, true));
}

function eventHandler(req, eType, stats) {
  const estats = stats.eventStats[eType];
  const card = cb(req.user)
    .title(sb(req.user).hc(eType))
    .color((estats.open.length) ? "OPEN" : "CLOSED")
    .field("Open", `${estats.openCount} of ${estats.count}`);

  if (estats.locations.length > 0) {
    card.field("Locations", estats.locations.join(", "));
  }

  if (estats.affectedApplications.length > 0) {
    const field = sb(req.user);
    estats.affectedApplications.forEach((app) => {
      field.e(app, stats.affectedEntities[app]).s("\n");
    });
    card.field("Affected Applications", field);
  }

  if (estats.root) {
    card.title("[ROOT CAUSE]");
  }
  return card;
}

/**
 * One open problem
 *
 * @param {IDavisRequest} req
 * @param {IProblemDetails} problem
 * @param {IDetailStats} stats
 * @returns
 */
function openProblem(req, problem, stats) {
  return (stats.open) ? openRoot(req, problem, stats) : openNoRoot(req, problem, stats);
}

function openRoot(req, problem, stats) {
  const topEvent = stats.topEvent;
  const topEventType = topEvent.eventType;
  const topEventEntityId = topEvent.entityId;
  const topEventEntityName = topEvent.entityName;
  const startTime = problem.startTime;

  const rootEvent = problem.rankedEvents[0];
  const rootEventType = rootEvent.eventType;
  const rootEventEntityId = rootEvent.entityId;
  const rootEventEntityName = rootEvent.entityName;
  const rootEventEndTime = rootEvent.endTime;

  const text = sb(req.user).s("There is currently").hc(topEventType).s("on")
    .e(topEventEntityId, topEventEntityName).s("that started").ts(startTime).p
    .s("The root cause of this issue is a").hc(rootEventType).s("on")
    .e(rootEventEntityId, rootEventEntityName);
  // There is currently a {top event type} on {top event entity} that started {startTime}.
  // The root cause of this issue is a {root event} on {root entity}

  // IF ROOT OPEN
    // which is still ongoing.
  // ELSE
    // which was resolved at {time}.
  if (rootEvent.status === "OPEN") {
    text.s("which is still ongoing.");
  } else {
    text.s("which was resolved at").ts(rootEventEndTime).s(".");
  }

  // IF 0 APPLICATIONS AFFECTED
    // This issue does not appear to be affecting any applications.
  // IF 1 APPLICATION AFFECTED
    // This issue is affecting {appname}.
  // IF 2 APPLICATIONS AFFECTED
    // This issue is affecting {appname} and {appname}.
  // ELSE
    // This issue is affecting {num} applications.
  if (stats.affectedApplications.length === 0) {
    text.s("This issue does not appear to be affecting any applications");
  } else if (stats.affectedApplications.length === 1) {
    const eid = stats.affectedApplications[0];
    const name = stats.affectedEntities[eid];
    text.s("This issue appears only to be affecting").e(eid, name).s(".");
  } else if (stats.affectedApplications.length === 2) {
    const eid1 = stats.affectedApplications[0];
    const name1 = stats.affectedEntities[eid1];
    const eid2 = stats.affectedApplications[1];
    const name2 = stats.affectedEntities[eid2];
    text.s("This issue is affecting").e(eid1, name1).s("and").e(eid2, name2).s(".");
  } else {
    text.s("This issue is affecting").s(stats.affectedApplications.length).s("applications.");
  }

  return text;
}

function openNoRoot(req, problem, stats) {
  const topEvent = stats.topEvent;
  const topEventType = topEvent.eventType;
  const topEventEntityId = topEvent.entityId;
  const topEventEntityName = topEvent.entityName;
  const startTime = problem.startTime;

  const text = sb(req.user).s("There is currently").hc(topEventType).s("on")
    .e(topEventEntityId, topEventEntityName).s("that started").ts(startTime).p
    .s("Dynatrace was unable to determine a root cause for this issue.");
  // There is currently a {top event type} on {top event entity} that started {startTime}.

  // IF 0 APPLICATIONS AFFECTED
    // This issue does not appear to be affecting any applications.
  // IF 1 APPLICATION AFFECTED
    // This issue is affecting {appname}.
  // IF 2 APPLICATIONS AFFECTED
    // This issue is affecting {appname} and {appname}.
  // ELSE
    // This issue is affecting {num} applications.
  if (stats.affectedApplications.length === 0) {
    text.s("This issue does not appear to be affecting any applications");
  } else if (stats.affectedApplications.length === 1) {
    const eid = stats.affectedApplications[0];
    const name = stats.affectedEntities[eid];
    text.s("The only application being affected by this issue is").e(eid, name).s(".");
  } else if (stats.affectedApplications.length === 2) {
    const eid1 = stats.affectedApplications[0];
    const name1 = stats.affectedEntities[eid1];
    const eid2 = stats.affectedApplications[1];
    const name2 = stats.affectedEntities[eid2];
    text.s("This issue is affecting").e(eid1, name1).s("and").e(eid2, name2).s(".");
  } else {
    text.s("This issue is affecting").s(stats.affectedApplications.length).s("applications.");
  }

  return text;
}

/**
 * One closed problem
 *
 * @param {IDavisRequest} req
 * @param {IProblemDetails} problem
 * @param {IDetailStats} stats
 * @returns
 */
function closedProblem(req, problem, stats) {
  return (stats.open) ? closedRoot(req, problem, stats) : closedNoRoot(req, problem, stats);
}

function closedRoot(req, problem, stats) {
  const topEvent = stats.topEvent;
  const topEventType = topEvent.eventType;
  const topEventEntityId = topEvent.entityId;
  const topEventEntityName = topEvent.entityName;
  const startTime = problem.startTime;
  const endTime = problem.endTime;

  const rootEvent = problem.rankedEvents[0];
  const rootEventType = rootEvent.eventType;
  const rootEventEntityId = rootEvent.entityId;
  const rootEventEntityName = rootEvent.entityName;
  const rootEventEndTime = rootEvent.endTime;

  const text = sb(req.user).s("There was").hc(topEventType).s("on")
    .e(topEventEntityId, topEventEntityName).s("that started").ts(startTime)
    .s("and ended").ts(endTime).p.s("The root cause of this issue was a")
    .hc(rootEventType).s("on").e(rootEventEntityId, rootEventEntityName);


  // IF ROOT OPEN
    // which is still ongoing.
  // ELSE
    // which was resolved at {time}.
  if (rootEvent.status === "OPEN") {
    text.s("which is still ongoing.");
  } else {
    text.s("which was resolved at").ts(rootEventEndTime).s(".");
  }

  // IF 0 APPLICATIONS AFFECTED
    // This issue does not appear to be affecting any applications.
  // IF 1 APPLICATION AFFECTED
    // This issue is affecting {appname}.
  // IF 2 APPLICATIONS AFFECTED
    // This issue is affecting {appname} and {appname}.
  // ELSE
    // This issue is affecting {num} applications.
  if (stats.affectedApplications.length === 0) {
    text.s("This issue does not appear to have affected any applications");
  } else if (stats.affectedApplications.length === 1) {
    const eid = stats.affectedApplications[0];
    const name = stats.affectedEntities[eid];
    text.s("The only application affected was").e(eid, name).s(".");
  } else if (stats.affectedApplications.length === 2) {
    const eid1 = stats.affectedApplications[0];
    const name1 = stats.affectedEntities[eid1];
    const eid2 = stats.affectedApplications[1];
    const name2 = stats.affectedEntities[eid2];
    text.s("This issue affected").e(eid1, name1).s("and").e(eid2, name2).s(".");
  } else {
    text.s("This issue affected").s(stats.affectedApplications.length).s("applications.");
  }

  return text;
}

function closedNoRoot(req, problem, stats) {
  const topEvent = stats.topEvent;
  const topEventType = topEvent.eventType;
  const topEventEntityId = topEvent.entityId;
  const topEventEntityName = topEvent.entityName;
  const startTime = problem.startTime;
  const endTime = problem.endTime;

  const text = sb(req.user).s("There was").hc(topEventType).s("on")
    .e(topEventEntityId, topEventEntityName).s("that started").ts(startTime)
    .s("and ended").ts(endTime).p
    .s("Dynatrace was unable to determine a root cause for this issue.");

  // IF 0 APPLICATIONS AFFECTED
    // This issue does not appear to be affecting any applications.
  // IF 1 APPLICATION AFFECTED
    // This issue is affecting {appname}.
  // IF 2 APPLICATIONS AFFECTED
    // This issue is affecting {appname} and {appname}.
  // ELSE
    // This issue is affecting {num} applications.
  if (stats.affectedApplications.length === 0) {
    text.s("This issue does not appear to have affected any applications");
  } else if (stats.affectedApplications.length === 1) {
    const eid = stats.affectedApplications[0];
    const name = stats.affectedEntities[eid];
    text.s("Only").e(eid, name).s("was affected by this issue.");
  } else if (stats.affectedApplications.length === 2) {
    const eid1 = stats.affectedApplications[0];
    const name1 = stats.affectedEntities[eid1];
    const eid2 = stats.affectedApplications[1];
    const name2 = stats.affectedEntities[eid2];
    text.s("This issue affected").e(eid1, name1).s("and").e(eid2, name2).s(".");
  } else {
    text.s("This issue affected").s(stats.affectedApplications.length).s("applications.");
  }

  return text;
}

function problemTitle(user, problem) {
  const last = problem.rankedEvents.length - 1;
  return sb(user)
    .hc(problem.rankedEvents[last].eventType)
    .s("on").e(problem.rankedEvents[last].entityId, problem.rankedEvents[last].entityName);
}

module.exports = DetailProblem;
