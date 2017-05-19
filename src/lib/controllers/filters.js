"use strict";

const _ = require("lodash");

const FilterModel = require("../models/filter");

const logger = require("../core/logger");
const DError = require("../core/error");

class Filters {

  static async create(user, filter) {
    const f = _.assign(filter, { owner: user._id, tenant: user.tenant });
    const filterModel = new FilterModel(f);
    return filterModel.save();
  }

  static async update(user, id, filter) {
    const f = await FilterModel.findById(id);
    if (!filter) {
      logger.info({ user }, `Unable to find a filter with the ID ${id}.`);
      throw new DError("Unable to find a filter with that ID!", 400);
    } else if (!filter.owner.equals(user._id)) {
      logger.warn({ user }, "Rejecting unauthorized filter deletions.");
      throw new DError("Only the owner of the filter can update it.", 403);
    }
    _.assign(f, filter);
    return f.save();
  }

  static async delete(user, id) {
    const filter = FilterModel.findById(id);

    if (!filter) {
      logger.info({ user }, `Unable to find a filter with the ID ${id}.`);
      throw new DError("Unable to find a filter with that ID!", 400);
    } else if (!filter.owner.equals(user._id)) {
      logger.warn({ user }, "Rejecting unauthorized filter deletions.");
      throw new DError("Only the owner of the filter can delete it.", 403);
    }

    return FilterModel.remove(id);
  }

  static async getFilters(user) {
    return FilterModel.find({ tenant: user.tenant });
  }

  static async getById(id) {
    return FilterModel.findById(id);
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
    if (sortedFilters.length > 0) {
      return _.filter(sortedFilters, f => f.scope === sortedFilters[0].scope);
    }
    logger.debug("No matching filters found.");
    return [];
  }
}

module.exports = Filters;
