"use strict";

const moment = require("moment");
const Aliases = require("../../controllers/aliases");
const Util = require("../../util");
const Entity = require("./entity");
const helpers = require("./helpers");
const TimeRange = require("./time-range");
const TimeStamp = require("./time-stamp");
const Link = require("./link");
const _ = require("lodash");
const string = require("string");

/**
 * String Builder
 *
 * @class StringBuilder
 */
class StringBuilder {
  /**
   * Creates an instance of StringBuilder.
   *
   * @param {IUserModel} user
   *
   * @memberOf StringBuilder
   */
  constructor(user) {
    this.user = user;
    this.state = [];
  }

  /**
   *    * Add an entity
   *
   * @param {string} entityId
   * @param {string} fallback
   * @returns
   *
   * @memberOf StringBuilder
   */
  e(entityId, fallback) {
    if (!this.entitiesRunning) {
      this.aliases = Aliases.getByTenant(this.user.tenant);
    }
    this.entitiesRunning = true;
    this.state.push(this.aliases.then((aliases) => {
      const alias = _.find(aliases, { entityId });
      if (!alias) { return new Entity(null, fallback); }
      return new Entity(alias, fallback);
    }));
    return this;
  }

  /**
   *    * Add an entity
   *
   * @param {string} entityId
   * @param {string} fallback
   * @returns
   *
   * @memberOf StringBuilder
   */
  entity(entityId, fallback) {
    return this.e(entityId, fallback);
  }

  /**
   *    * Add a time stamp
   *
   * @param {number} val
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf StringBuilder
   */
  ts(val, compact) {
    this.state.push(new TimeStamp(val, this.user.timezone, compact));
    return this;
  }

  /**
   *    * Add a time stamp
   *
   * @param {number} val
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf StringBuilder
   */
  tstamp(val, compact) {
    return this.ts(val, compact);
  }

  /**
   *    * Add a time range
   *
   * @param {number} start
   * @param {number} end
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf StringBuilder
   */
  tr(start, end, compact) {
    this.state.push(new TimeRange(start, end, this.user.timezone, compact));
    return this;
  }

  /**
   *    * Add a time range
   *
   * @param {number} start
   * @param {number} end
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf StringBuilder
   */
  trange(start, end, compact) {
    return this.tr(start, end, compact);
  }

  /**
   * Add a buildable object with optional pluralization
   *
   * @param {IBuildable} singular
   * @param {IBuildable} plural
   * @param {number | boolean | any[]} count
   * @returns {StringBuilder} this
   *
   * @memberOf StringBuilder
   */
  s(singular, plural, count) {
    if (singular && singular.constructor && singular.constructor === Array) {
      this.state.push(_.sample(singular));
      return this;
    }
    if (typeof count === "number") {
      return (count === 1) ? this.s(singular) : this.s(plural);
    }
    if (count && count.constructor === Array) {
      return this.s(singular, plural, count.length);
    }
    if (typeof count === "boolean") {
      if (!count) {
        return this.s(plural);
      }
    }
    this.state.push(singular);
    return this;
  }

  /**
   * Add a buildable object with optional pluralization
   *
   * @param {IBuildable} singular
   * @param {IBuildable} plural
   * @param {number | any[]} count
   * @returns {StringBuilder} this
   *
   * @memberOf StringBuilder
   */
  stringable(singular, plural, count) {
    return this.s(singular, plural, count);
  }

  link(url, text) {
    return this.s(new Link(url, text));
  }

  /**
   *    * Add a humanized string object
   *
   * @param {string} item
   * @returns
   *
   * @memberOf StringBuilder
   */
  h(item) {
    return this.s(string(item).humanize().s.toLowerCase());
  }

  /**
   *    * Add a humanized string object
   *
   * @param {string} item
   * @returns
   *
   * @memberOf StringBuilder
   */
  humanize(item) {
    return this.h(item);
  }

  /**
   * Humanize and capitalize
   *
   * @param {string} item
   * @returns
   *
   * @memberof StringBuilder
   */
  hc(item) {
    return this.s(helpers.fixCaps(string(item).humanize().titleCase().s));
  }

  /**
   *    * Add a duration
   *
   * @param {string} range
   * @returns
   *
   * @memberOf StringBuilder
   */
  d(range) {
    const now = moment.tz(this.user.timezone);
    const start = now.clone().subtract(moment.duration(range));
    this.state.push(Util.Date.preciseDiff(now, start));
    return this;
  }

  /**
   *    * Add a duration
   *
   * @param {string} range
   * @returns
   *
   * @memberOf StringBuilder
   */
  duration(range) {
    return this.d(range);
  }

  date(date) {
    const { startTime, endTime, grain } = Util.Date.dateParser(date, this.user);
    const thisWeek = moment.tz(this.user.timezone).isoWeek();
    if (grain === "week") {
      if (thisWeek === moment.tz(startTime, this.user.timezone).isoWeek()) {
        this.s("This week");
      } else if (thisWeek === moment.tz(startTime, this.user.timezone).add(1, "week").isoWeek()) {
        this.s("Last week");
      } else if (thisWeek === moment.tz(startTime, this.user.timezone).subtract(1, "week").isoWeek()) {
        this.s("Next week");
      } else {
        this.ts(startTime, endTime);
      }
    } else if (grain === "day") {
      this.s(moment.tz(startTime, this.user.timezone).calendar(null, {
        sameDay: "[Today]",
        nextDay: "[Tomorrow]",
        nextWeek: "[Next] dddd",
        lastDay: "[Yesterday]",
        lastWeek: "On dddd",
        sameElse: "DD/MM/YYYY",
      }));
    } else {
      this.ts(startTime, endTime);
    }
    return this;
  }

  /**
   *    * Add a period
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get p() {
    this.state.push(".");
    return this;
  }

  /**
   *    * Add a period
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get period() {
    return this.p;
  }

  /**
   *    * Add a comma
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get c() {
    this.state.push(",");
    return this;
  }

  /**
   *    * Add a comma
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get comma() {
    return this.c;
  }

  /**
   *    * Add a question mark
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get q() {
    this.state.push("?");
    return this;
  }

  /**
   *    * Add a question mark
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get question() {
    return this.q;
  }

  /**
   *    * Add a newline
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get n() {
    this.state.push("\n");
    return this;
  }

  /**
   *    * Add a newline
   *
   * @readonly
   *
   * @memberOf StringBuilder
   */
  get newline() {
    return this.n;
  }

  /**
   * Generate a string representation
   *
   * @returns {Promise<string>}
   *
   * @memberOf StringBuilder
   */
  async toString() {
    return helpers.stringify(this.state);
  }

  /**
   * Generate an audible representation
   *
   * @returns {Promise<string>}
   *
   * @memberOf StringBuilder
   */
  async audible() {
    return helpers.audible(this.state);
  }

  /**
   * Generate a slack representation
   *
   * @returns {Promise<string>}
   *
   * @memberOf StringBuilder
   */
  async slack() {
    return helpers.slackify(this.state);
  }
}

module.exports = StringBuilder;
