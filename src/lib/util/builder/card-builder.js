"use strict";

/* eslint-disable no-unused-vars */

const StringBuilder = require("./string-builder");
const Field = require("./field");

const COLORS = {
  CLOSED: "#7dc540",
  GREEN: "#7dc540",
  OPEN: "#dc172a",
  RED: "#dc172a",
};

/**
 * Visual Card builder
 *
 * @class CardBuilder
 */
class CardBuilder {
  constructor(user) {
    this.user = user;
    this.filtered = false;
    this.fields = [];
    this.titleLink = "";
    this.colorCode = "";
    this.text = new StringBuilder(user);
    this.fallback = new StringBuilder(user);
    this.titleText = new StringBuilder(user);
    this.footer = new StringBuilder(user);
    this.pretext = new StringBuilder(user);
    this.author = new StringBuilder(user);
  }

  /**
   * Push a stringable or slackable object to text field
   *
   * @param {IBuildable} item
   * @returns
   *
   * @memberOf CardBuilder
   */
  s(item) {
    this.text.s(item);
    return this;
  }

  /**
   * Push a stringable or slackable object to text field
   *
   * @param {IBuildable} item
   * @returns
   *
   * @memberOf CardBuilder
   */
  stringable(item) {
    return this.s(item);
  }

  /**
   * Add an entity to text field
   *
   * @param {string} entityId
   * @param {string} fallback
   * @returns
   *
   * @memberOf CardBuilder
   */
  e(entityId, fallback) {
    this.text.e(entityId, fallback);
    return this;
  }

  /**
   * Add an entity to text field
   *
   * @param {string} entityId
   * @param {string} fallback
   * @returns
   *
   * @memberOf CardBuilder
   */
  entity(entityId, fallback) {
    return this.e(entityId, fallback);
  }

  /**
   * Add a time stamp to text field
   *
   * @param {number} val
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf CardBuilder
   */
  ts(val, compact) {
    this.text.ts(val, compact);
    return this;
  }

  /**
   * Add a time stamp to text field
   *
   * @param {number} val
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf CardBuilder
   */
  tstamp(val, compact) {
    return this.ts(val, compact);
  }

  /**
   * Add a time range to text field
   *
   * @param {number} start
   * @param {number} end
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf CardBuilder
   */
  tr(start, end, compact) {
    this.text.tr(start, end, compact);
    return this;
  }

  /**
   * Add a time range to text field
   *
   * @param {number} start
   * @param {number} end
   * @param {boolean} [compact]
   * @returns
   *
   * @memberOf CardBuilder
   */
  trange(start, end, compact) {
    return this.tr(start, end, compact);
  }

  /**
   * Set filtered status
   *
   * @param {boolean} [filtered=true]
   *
   * @memberOf CardBuilder
   */
  f(filtered = true) {
    this.filtered = filtered;
    return this;
  }

  /**
   * Set filtered status
   *
   * @param {boolean} [filtered=true]
   *
   * @memberOf CardBuilder
   */
  filter(filtered = true) {
    return this.f(filtered);
  }

  field(title, value, short = true) {
    this.fields.push(new Field(title, value, short));
    return this;
  }

  title(s) {
    this.titleText.s(s);
    return this;
  }

  /**
   * Set the title link url
   *
   * @param {string} url
   *
   * @memberOf CardBuilder
   */
  url(url) {
    this.titleLink = url;
    return this;
  }

  /**
   * Set color
   *
   * @param {string} color
   *
   * @memberOf CardBuilder
   */
  color(color) {
    this.colorCode = COLORS[color] || "";
    return this;
  }

  /**
   * Add a period to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get p() {
    const _ = this.text.p;
    return this;
  }

  /**
   * Add a period to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get period() {
    return this.p;
  }

  /**
   * Add a comma to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get c() {
    const _ = this.text.c;
    return this;
  }

  /**
   * Add a comma to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get comma() {
    return this.c;
  }

  /**
   * Add a question mark to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get q() {
    const _ = this.text.q;
    return this;
  }

  /**
   * Add a question mark to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get question() {
    return this.q;
  }

  /**
   * Add a newline to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get n() {
    const _ = this.text.n;
    return this;
  }

  /**
   * Add a newline to text field
   *
   * @readonly
   *
   * @memberOf CardBuilder
   */
  get newline() {
    return this.n;
  }

  /**
   * Output a slack ready object
   *
   * @returns {Promise<string>}
   *
   * @memberOf CardBuilder
   */
  async slack() {
    const [fallback, footer, pretext, authorName, text, title, fields] = await Promise.all([
      this.fallback.toString(),
      this.footer.slack(),
      this.pretext.slack(),
      this.author.slack(),
      this.text.slack(),
      this.titleText.slack(),
      await Promise.all(this.fields.map(f => f.slack())),
    ]);

    const out = { fallback, footer, pretext, author_name: authorName, text, title, fields };
    out.color = this.colorCode;
    out.title_link = this.titleLink;

    Object.keys(out).forEach((key) => {
      if (out[key] === "") {
        delete out[key];
      }
    });

    return out;
  }
}

module.exports = CardBuilder;
