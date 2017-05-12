const _ = require("lodash");
const moment = require("moment");
const { sb } = require("./builder");

/**
 * Compute stats on a problem detail reponse
 *
 * @param {IProblemDetail} detail
 * @returns
 *
 */
function detailStats(detail) {
  const affectedEntities = {};

  _.forEach(detail.rankedEvents, (event) => {
    affectedEntities[event.entityId] = event.entityName;
  });

  const affectedApplications = _.uniq(_.map(_.filter(detail.rankedEvents, e => e.impactLevel === "APPLICATION"), "entityId"));

  return {
    affectedEntities,
    affectedApplications,
    topEvent: detail.rankedEvents[detail.rankedEvents.length - 1],
    roots: _.filter(detail.rankedEvents, "isRootCause"),
    eventTypes: _.uniq(_.map(detail.rankedEvents, "eventType")),
    eventStats: eventStats(detail.rankedEvents),
    open: detail.status === "OPEN",
  };
}

/**
 * Compute stats about a list of events
 *
 * @param {IRankedEvents} eventList
 * @returns {IEventStats}
 *
 */
function eventStats(eventList) {
  const stats = {};
  const groupedEvents = _.groupBy(eventList, "eventType");
  const types = _.uniq(_.map(eventList, "eventType"));

  types.forEach((type) => {
    const events = groupedEvents[type];
    const count = events.length;
    const open = events.filter(e => e.status === "OPEN");
    const openCount = open.length;
    const closedCount = count - openCount;
    const roots = _.filter(events, "isRootCause");
    const root = roots.length > 0;
    const locations = _.flatMap(events, e => e.affectedSyntheticLocations || []);

    const affectedApplications = _.uniq(_.map(_.filter(events, { impactLevel: "APPLICATION" }), "entityId"));

    stats[type] = {
      affectedApplications,
      events,
      count,
      open,
      openCount,
      closedCount,
      root,
      roots,
      locations,
    };
  });

  return stats;
}

/**
 * Filter this list of problems by time range, impactLevel, status,
 * entityId, or severityLevel using the options object

 * @param {IProblem[]} problems
 * @param {IFilterOptions} options
 * @returns {IProblem[]}
 *
 */
function filterProblemFeed(problems, options) {
  let filtered = _.cloneDeep(problems);

  // filter by impactLevel, status, severityLevel
  if (options.impactLevel || options.status || options.severityLevel) {
    const lodashFilterOptions = _.pick(options, ["impactLevel", "status", "severityLevel"]);
    filtered = _.filter(filtered, lodashFilterOptions);
  }

  // { startTime, endTime }
  if (options.timeRange && options.timeRange.startTime && options.timeRange.endTime) {
    filtered = _.filter(filtered, problem =>
      problem.startTime > options.timeRange.startTime &&
      problem.startTime < options.timeRange.endTime);
  }

  // filter by entityId
  if (options.entityId) {
    filtered = _.filter(filtered, problem =>
      _.filter(problem.rankedImpacts, { entityId: options.entityId }).length > 0);
  }

  return filtered;
}

/**
 * Get a stringmap of entity ids to entity names affected
 *
 * @param {IProblem[]} problems
 * @returns
 *
 */
function getAffectedEntities(problems) {
  const entities = {};
  problems.forEach((problem) => {
    problem.rankedImpacts.forEach((impact) => {
      entities[impact.entityId] = impact.entityName;
    });
  });
  return entities;
}

/**
 * Group problems by the hour in which they start
 *
 * @param {IProblem[]} problems
 * @returns {[hour: string]: IProblem[]}
 *
 */
function groupByHour(problems) {
  return _.groupBy(problems, problem => (Math.floor(problem.startTime / 3600000) * 3600000));
}


/**
 * Compute stats about a list of problems
 *
 * @param {IProblem[]} problems
 * @returns
 *
 */
function problemStats(problems) {
  const allImpacts = _.flatMap(problems, problem => problem.rankedImpacts);
  const affectedApplications = _.uniq(_.map(_.filter(allImpacts, { impactLevel: "APPLICATION" }), "entityId"));
  const rooted = _.filter(problems, "hasRootCause");
  return {
    allImpacts,
    affectedApplications,
    rooted,
    affectedEntities: getAffectedEntities(problems),
    hourly: groupByHour(problems),
    firstProblem: _.minBy(problems, "startTime"),
    lastProblem: _.maxBy(problems, "startTime"),
    openProblems: _.filter(problems, { status: "OPEN" }),
  };
}

/**
 * Convert an ISO 8601 date range into a Dynatrace relativeTime
 *
 * @param {string} range
 * @returns {string}
 *
 */
function rangeToRelativeTime(range) {
  const duration = moment.duration(range).asSeconds();
  return (duration <= 60 * 60) ? "hour" :
    (duration <= 2 * 60 * 60) ? "2hours" :
      (duration <= 6 * 60 * 60) ? "6hours" :
        (duration <= 24 * 60 * 60) ? "day" :
          (duration <= 7 * 24 * 60 * 60) ? "week" :
            "month";
}

function summarize(user, problems, app = false, present = false) {
  const stats = problemStats(problems);
  const out = sb(user);

  // Which application was the most heavily affected?
  if (!app) {
    const appCounts = _.countBy(_.filter(stats.allImpacts, { impactLevel: "APPLICATION" }), "entityId");
    const mostAffected = _.maxBy(Object.keys(appCounts), eid => appCounts[eid]);
    const mostAffectedCount = _.filter(problems, problem =>
      _.filter(problem.rankedImpacts, { entityId: mostAffected }).length).length;
    out.s("The most affected application").s("is", "was", present).e(mostAffected, stats.affectedEntities[mostAffected])
      .c.s("which is being affected by", "which was affected by", present).s(mostAffectedCount).s("issue.", "issues.", mostAffectedCount);
  }

  // Which entity caused the most roots?
  if (stats.rooted.length > 2) {
    const rootImpacts = stats.rooted.map(root => root.rankedImpacts[0]);
    const rootEntityCounts = _.countBy(rootImpacts, "entityId");
    const topRootEntity = _.maxBy(Object.keys(rootEntityCounts), eid => rootEntityCounts[eid]);
    const topRootEntityCount = rootEntityCounts[topRootEntity];
    if (topRootEntityCount > 2) {
      out.e(topRootEntity, stats.affectedEntities[topRootEntity]).s("is", "was", present).s("particularly troublesome,")
        .s("causing").s(topRootEntityCount).s("problems.");
    }
  }

  // Were the problems concentrated in a particular hour?
  if (Object.keys(stats.hourly).length === 1) {
    out.s("These issues all occurred at around the same time");
  } else {
    const topHour = _.maxBy(Object.keys(stats.hourly), hour => stats.hourly[hour].length);
    const topHourCount = stats.hourly[topHour].length;
    if (topHourCount > 2) {
      out.s("The largest concentration of problems was around").ts(Number.parseInt(topHour, 10)).s(".");
    }
  }

  return out;
}

/**
 * Turn a problem detail model into normal Dynatrace object format
 *
 * @param {IProblemDetailModel} problem
 * @returns {IProblemDetail}
 *
 */
function unmodelProblem(problem) {
  const out = problem.toObject();
  return {
    id: out.pid,
    startTime: out.startTime,
    endTime: out.endTime,
    displayName: out.displayName,
    impactLevel: out.impactLevel,
    status: out.status,
    severityLevel: out.severityLevel,
    rankedEvents: out.rankedEvents,
    tagsOfAffectedEntities: out.tagsOfAffectedEntities,
  };
}

module.exports = {
  detailStats,
  filterProblemFeed,
  getAffectedEntities,
  problemStats,
  rangeToRelativeTime,
  summarize,
  unmodelProblem,
};
