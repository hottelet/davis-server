const moment = require("moment");
const rp = require("request-promise");
const _ = require("lodash");
const natural = require("natural");

const Aliases = require("../../controllers/aliases");
const ProblemDetails = require("../../controllers/problemDetails");
const logger = require("../logger");
const DError = require("../../core/error");
const Util = require("../../util");

/**
 * Static class for interacting with Dynatrace
 *
 * @class Dynatrace
 */
class Dynatrace {
  /**
   * Make GET requests against a user's Dynatrace API
   *
   * @static
   * @param {IUserModel} user
   * @param {string} endpoint
   * @param {*} [options]
   * @returns {Promise<any>}
   *
   * @memberOf Dynatrace
   */
  static async get(user, endpoint, options, tokens) {
    const baseUrl = user.dynatraceApiUrl;
    const apiTokens = tokens || user.dynatraceApiTokens();
    const apiToken = apiTokens.shift();

    const uri = `${baseUrl}/api/v1/${endpoint}`;

    try {
      const response = await rp.get(uri, {
        headers: {
          Authorization: `Api-Token ${apiToken}`,
        },
        json: true,
        qs: options,
        timeout: 20000,
        time: true,
        transform: logDynatraceTimes,
      });

      const tenant = user.tenant;
      await tenant.setActiveToken(apiToken);
      return response;
    } catch (err) {
      if (err.statusCode === 400) {
        if (_.has(err, "response.error.message")) {
          throw new DError(`Unable to contact Dynatrace!  ${err.response.error.message}`);
        }
        throw new DError("Unable to contact Dynatrace!  Are you sure you set the correct URL?");
      } else if (err.statusCode === 401) {
        if (apiTokens.length > 0) {
          return Dynatrace.get(user, endpoint, options, apiTokens);
        }
        throw new DError("The configured Dynatrace API token is invalid!");
      } else if (err.error && err.error.code === "ENOENT") {
        throw new DError("Unable to contact Dynatrace!  Are you sure you have an active network connection?");
      } else {
        logger.error(`Dynatrace responded with an unhandled status code of ${err.statusCode}.`);
        throw new DError("Unfortunately, there was an issue communicating with Dynatrace.");
      }
    }
  }

  static async post(user, endpoint, body, tokens) {
    const baseUrl = user.dynatraceApiUrl;
    const apiTokens = tokens || user.dynatraceApiTokens();
    const apiToken = apiTokens.shift();

    const uri = `${baseUrl}/api/v1/${endpoint}`;

    try {
      const response = await rp.post(uri, {
        headers: {
          Authorization: `Api-Token ${apiToken}`,
        },
        json: true,
        body,
        timeout: 20000,
        time: true,
        transform: logDynatraceTimes,
      });

      const tenant = user.tenant;
      await tenant.setActiveToken(apiToken);
      return response;
    } catch (err) {
      if (err.statusCode === 400) {
        if (_.has(err, "response.error.message")) {
          throw new DError(`Unable to contact Dynatrace!  ${err.response.error.message}`);
        }
        throw new DError("Unable to contact Dynatrace!  Are you sure you set the correct URL?");
      } else if (err.statusCode === 401) {
        if (apiTokens.length > 0) {
          return Dynatrace.post(user, endpoint, body, apiTokens);
        }
        throw new DError("The configured Dynatrace API token is invalid!");
      } else if (err.error && err.error.code === "ENOENT") {
        throw new DError("Unable to contact Dynatrace!  Are you sure you have an active network connection?");
      } else {
        logger.error(`Dynatrace responded with an unhandled status code of ${err.statusCode}.`);
        throw new DError("Unfortunately, there was an issue communicating with Dynatrace.");
      }
    }
  }

  static async getUserActivity(user, options) {
    const params = _.pick(_.assign({
      timeseriesId: "com.dynatrace.builtin:app.useractionsperminute",
      queryMode: "series",
      aggregationType: "count",
    }, options), ["timeseriesId", "queryMode", "aggregationType", "relativeTime"]);

    if (options.relativeTime &&
      !(/^hour$|^2hours$|^6hours$|^day$|^week$|^month$|^30mins$/.test(options.relativeTime))) {
      const range = options.relativeTime;
      const duration = moment.duration(range);
      params.relativeTime = Util.Dynatrace.rangeToRelativeTime(range);
      const activity = await Dynatrace.getUserActivity(user, params);
      const start = moment().subtract(duration).valueOf();
      Object.keys(activity.dataPoints).forEach((entity) => {
        activity.dataPoints[entity] = activity
          .dataPoints[entity]
          .filter(dp => dp[0] > start);
      });
      return activity;
    }

    if (options.timeRange) {
      const startTime = options.timeRange.startTime;
      const endTime = options.timeRange.endTime;
      const range = moment.duration(moment().valueOf() - startTime);
      params.relativeTime = Util.Dynatrace.rangeToRelativeTime(range);

      const activity = await Dynatrace.getUserActivity(user, params);
      Object.keys(activity.dataPoints).forEach((entity) => {
        activity.dataPoints[entity] = activity
          .dataPoints[entity]
          .filter(dp => dp[0] > startTime && dp[0] < endTime);
      });
      return activity;
    }

    const ts = await Dynatrace.get(user, "timeseries", params);
    return ts.result;
  }

  static async predictUserActivity(user, entity) {
    const params = {
      entity,
      relativeTime: "30mins",
      predict: true,
    };

    return this.getUserActivity(user, params);
  }

  /**
   * Find an application that sounds like the given string
   *
   * @static
   * @param {any} user
   * @param {any} str
   * @returns
   *
   * @memberof Dynatrace
   */
  static async findApplicationBySoundalike(user, str) {
    logger.debug(`Searching for: ${str}`);
    const apps = await Dynatrace.getApplications(user);
    let entity;
    apps.forEach((app) => {
      if (entity) { return; }
      if (natural.Metaphone.compare(app.name, str)) {
        entity = app;
        logger.debug(`Found ${entity.display.visual}`);
      } else if (_.filter(app.aliases, alias => natural.Metaphone.compare(alias, str)).length > 0) {
        entity = app;
        logger.debug(`Found ${entity.display.visual}`);
      }
    });
    return entity;
  }

  /**
   * Get all entities from
   *
   * @static
   * @param {IUserModel} user
   * @returns { applications[], services: IService[], hosts: IHost[], processGroups: IProcessGroup[] }
   *
   * @memberOf Dynatrace
   */
  static async getAllEntities(user) {
    const [applications, services, hosts, processGroups] = await Promise.all([
      Dynatrace.getApplications(user),
      Dynatrace.getServices(user),
      Dynatrace.getHosts(user),
      Dynatrace.getProcessGroups(user),
    ]);

    return { applications, services, hosts, processGroups };
  }

  /**
   * Get applications
   *
   * @static
   * @param {IUserModel} user
   * @returns {Promise<IApplication[]>}
   *
   * @memberOf Dynatrace
   */
  static async getApplications(user) {
    const [apps, aliases] = await Promise.all([
      Dynatrace.get(user, "entity/applications")
        .then(res => res.filter(app => app.applicationType !== "SYNTHETIC")),
      Aliases.getByTenant(user.tenant, "APPLICATION"),
    ]);
    return Dynatrace.mergeAliases(apps, aliases);
  }

  /**
   * Get services
   *
   * @static
   * @param {IUserModel} user
   * @returns {Promise<IService[]>}
   *
   * @memberOf Dynatrace
   */
  static async getServices(user) {
    const [services, aliases] = await Promise.all([
      Dynatrace.get(user, "entity/services"),
      Aliases.getByTenant(user.tenant, "SERVICE"),
    ]);
    return Dynatrace.mergeAliases(services, aliases);
  }

  /**
   * Get hosts
   *
   * @static
   * @param {IUserModel} user
   * @returns {Promise<IHost[]>}
   *
   * @memberOf Dynatrace
   */
  static async getHosts(user) {
    const [hosts, aliases] = await Promise.all([
      Dynatrace.get(user, "entity/infrastructure/hosts"),
      Aliases.getByTenant(user.tenant, "HOST"),
    ]);
    return Dynatrace.mergeAliases(hosts, aliases);
  }

  /**
   * Get process groups
   *
   * @static
   * @param {IUserModel} user
   * @returns {Promise<IProcessGroup[]>}
   *
   * @memberOf Dynatrace
   */
  static async getProcessGroups(user) {
    const [processGroups, aliases] = await Promise.all([
      Dynatrace.get(user, "entity/infrastructure/process-groups"),
      Aliases.getByTenant(user.tenant, "PROCESS_GROUP"),
    ]);
    return Dynatrace.mergeAliases(processGroups, aliases);
  }

  /**
   * Get a list of problems
   *
   * @static
   * @param {IUserModel} user
   * @param {IProblemFeedOptions} options
   * @returns {Promise<IProblem[]>}
   *
   * @memberOf Dynatrace
   */
  static async problemFeed(user, options) {
    const dynatraceOptions = _.cloneDeep(_.pick(options, ["relativeTime"]));

    if (options.relativeTime &&
      !(/^hour$|^2hours$|^6hours$|^day$|^week$|^month$/.test(options.relativeTime))) {
      const range = options.relativeTime;
      const duration = moment.duration(range);
      dynatraceOptions.relativeTime = Util.Dynatrace.rangeToRelativeTime(range);
      const res = await Dynatrace.get(user, "problem/feed", dynatraceOptions);
      return res
        .result
        .problems
        .filter(p => moment(p.startTime).isAfter(moment().subtract(duration)));
    }

    if (options.timeRange) {
      const startTime = options.timeRange.startTime;
      const endTime = options.timeRange.endTime;
      const range = moment.duration(moment().valueOf() - startTime);
      dynatraceOptions.relativeTime = Util.Dynatrace.rangeToRelativeTime(range);
      const res = await Dynatrace.get(user, "problem/feed", dynatraceOptions);
      return res
        .result
        .problems
        .filter(p =>
          moment(p.startTime).isAfter(moment(startTime)) &&
          moment(endTime).isAfter(p.startTime));
    }

    const res = await Dynatrace.get(user, "problem/feed", dynatraceOptions);
    return res.result.problems;
  }

  /**
   * Get details about a problem
   *
   * @static
   * @param {IUserModel} user
   * @param {string} pid
   * @returns {Promise<IProblem>}
   *
   * @memberOf Dynatrace
   */
  static async problemDetails(user, pid) {
    const details = await ProblemDetails.get(user, pid);
    if (details) {
      return Util.Dynatrace.unmodelProblem(details);
    }
    const res = await Dynatrace.get(user, `problem/details/${pid}`);
    if (res.result.status === "OPEN") {
      return res.result;
    }
    return Util.Dynatrace.unmodelProblem(await ProblemDetails.create(user, res.result));
  }

  /**
   * Merge aliases from the database with a list of entities
   *
   * @private
   * @static
   * @template T
   * @param {T[]} apps
   * @param {IAliasModel[]} aliases
   * @returns {T[]}
   *
   * @memberOf Dynatrace
   */
  static mergeAliases(apps, aliases) {
    return apps.map((app) => {
      const alias = _.find(aliases, a => app.entityId === a.entityId);
      app.name = app.customizedName || app.displayName || "";
      app.category = app.entityId.split("-")[0];
      // The name property makes these values unnecessary
      delete app.customizedName;
      delete app.displayName;
      // Found a match in the DB
      if (alias) {
        app.id = alias._id;
        app.aliases = alias.aliases;
        app.display = {
          audible: alias.display.audible || app.name,
          visual: alias.display.visual || app.name,
        };
      } else {
        app.id = null;
        app.aliases = [];
        app.display = { visual: app.name, audible: app.name };
      }
      return app;
    });
  }

  static async addCommentToProblem(user, pid, comment) {
    // const context = ;
    return this.post(user, `problem/details/${pid}/comments`, { comment, user: user.identifier, context: "Davis Managed" });
  }
}

function logDynatraceTimes(body, response) {
  const path = response.req.path.split("?")[0];
  const metadata = {
    type: "Dynatrace",
    path,
    code: response.statusCode,
    time: response.elapsedTime,
  };

  logger.info(metadata, `DYNATRACE API: ${path} ${response.statusCode} - ${response.elapsedTime} ms`);
  return body;
}

module.exports = Dynatrace;
