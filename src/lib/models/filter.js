"use strict";

const mongoose = require("mongoose");
const _ = require("lodash");

const DError = require("../core/error");
require("./user");
require("./tenant");

const statusEnum = {
  values: ["OPEN", "CLOSED"],
  message: "`{VALUE}` is an invalid problem status.  Please use either OPEN or CLOSED.",
};

const impactEnum = {
  values: ["APPLICATION", "SERVICE", "INFRASTRUCTURE"],
  message: "`{VALUE}` is an invalid problem impact. Please use APPLICATION, SERVICE or INFRASTRUCTURE.",
};

const severityEnum = {
  values: ["AVAILABILITY", "ERROR", "PERFORMANCE", "RESOURCE_CONTENTION", "CUSTOM_ALERT"],
  message: "`{VALUE}` is an invalid problem severity. Please use AVAILABILITY, ERROR, PERFORMANCE, RESOURCE_CONTENTION or CUSTOM_ALERT.",
};

const filterSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: [true, "A filter name is required!"] },
  owner: { type: "ObjectId", ref: "User", required: true },
  tenant: { type: "ObjectId", ref: "Tenant", required: true },
  scope: { type: String, default: "global" },
  description: { type: String, trim: true },
  enabled: { type: Boolean, default: true },
  status: [{ type: String, uppercase: true, trim: true, enum: statusEnum }],
  impact: [{ type: String, uppercase: true, trim: true, enum: impactEnum }],
  severityLevel: [{ type: String, uppercase: true, trim: true, enum: severityEnum }],
  entity: [{ type: String, trim: true }],
  excludeEventType: [{ type: String, trim: true }],
  tags: {
    includes: [{ type: String, trim: true }],
    excludes: [{ type: String, trim: true }],
  },
}, { timestamps: true });

filterSchema.index({ name: 1, scope: 1, tenant: 1 }, { unique: [true, "This name is already being used!"] });

class FilterClass {

  /**
   * Determines if a problem should be filtered or not
   *
   * @param {any} problem
   * @returns {Boolean}
   *
   * @memberof FilterClass
   */
  shouldIncludeProblem(problem) {
    if (this.status.length > 0 && this.status.indexOf(problem.status) === -1) return false;

    if (this.impact.length > 0 && this.impact.indexOf(problem.impactLevel) === -1) return false;

    if (problem.severityLevel && this.severityLevel.length > 0) {
      if (this.severityLevel.indexOf(problem.severityLevel) === -1) return false;
    }

    if (problem.tagsOfAffectedEntities
      && (this.tags.includes.length > 0 || this.tags.excludes.length > 0)) {
      const keys = _.map(problem.tagsOfAffectedEntities, tag => tag.key);
      if (_.intersection(keys, this.tags.excludes).length > 0) return false;
      if (_.intersection(keys, this.tags.includes).length !== this.tags.includes.length) {
        return false;
      }
    }

    if (this.entity.length > 0 || this.excludeEventType.length > 0) {
      // rankedImpacts = problem feed, rankedEvents = problem details
      const events = problem.rankedImpacts || problem.rankedEvents;
      let hasMatchingEntityID = false;
      for (const event of events) { // eslint-disable-line
        if (this.entity.length > 0) {
          if (!hasMatchingEntityID && this.entity.indexOf(event.entityId) !== -1) {
            hasMatchingEntityID = true;
          }
        }
        if (this.excludeEventType.length > 0
          && this.excludeEventType.indexOf(event.eventType) !== -1) return false;
      }
      if (this.entity.length > 0 && !hasMatchingEntityID) return false;
    }

    return true;
  }

  get priority() {
    return (this.scope === "global") ? 0 : this.scope.split(":").length;
  }
}

filterSchema.post("save", DError.handleMongoError);
filterSchema.post("update", DError.handleMongoError);

filterSchema.loadClass(FilterClass);
module.exports = mongoose.model("Filter", filterSchema);
