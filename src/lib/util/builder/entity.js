"use strict";

const string = require("string");

/**
 * Create audible and visual versions of entity aliases
 *
 * @class Entity
 */
class Entity {
  constructor(alias, fallback) {
    this.alias = alias;
    this.fallback = fallback;
  }

  slack() {
    return (this.alias) ? this.alias.display.visual : this.fallback;
  }

  audible() {
    return (this.alias) ? this.alias.display.audible : humanizeAppName(this.fallback);
  }

  toString() {
    return (this.alias) ? this.alias.display.visual : this.fallback;
  }
}


function humanizeAppName(name) {
  let out = name;
  out = out.replace(/^www\./, "");
  out = out.replace(/ - \d+/, "");
  out = out.replace(/:\d+/, "");
  return string(out).humanize().s;
}

module.exports = Entity;
