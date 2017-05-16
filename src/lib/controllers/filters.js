"use strict";

const _ = require("lodash");

const FilterModel = require("../models/filter");

const logger = require("../core/logger");

class Filters {

  static async create(user, filter) {
    const f = _.assign(filter, { owner: user._id, tenant: user.tenant });
    const filterModel = new FilterModel(f);
    return filterModel.save();
  }

  static async update(user, id, filter) {
    const f = await FilterModel.findById(id);
    // TODO security
    _.assign(f, filter);
    return f.save();
  }

  static async delete(user, id) {
    // TODO security
    return FilterModel.findByIdAndRemove(id);
  }

  static async getFilters(user) {
    return FilterModel.find({ tenant: user.tenant });
  }

  static async getFiltersByScope(user, scope) {
    const scopeArr = ["global"];
    const subScopeArr = [];

    _.forEach(_.split(scope, ":"), (s) => {
      subScopeArr.push(s);
      scopeArr.push(subScopeArr.join(":"));
    });

    const filters = await FilterModel
      .find({ tenant: user.tenant })
      .where("enabled", true)
      .where("scope").in(scopeArr);

    const sortedFilters = _.sortBy(filters, f => -f.priority);
    if (sortedFilters > 0) {
      return _.filter(sortedFilters, f => f.scope === sortedFilters[0].scope);
    }
    logger.debug("No matching filters found.");
    return [];
  }
}

module.exports = Filters;
