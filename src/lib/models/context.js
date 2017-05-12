"use strict";

const mongoose = require("mongoose");

const contextSchema = new mongoose.Schema({
  filters: {
    default: {},
    type: {
      app: String,
      time: {
        end: Number,
        start: Number,
      },
    },
  },

  intentHistory: [String],

  paging: {
    active: { type: Number, default: -1 },
    items: [{
      id: String,
      source: String,
      target: String,
    }],
    page: { type: Number, default: 0 },
  },

  // scope uniquely identifies the user
  // on the particular tenant and source
  scope: { type: String, unique: true },

  // target intent names
  // for various routing
  // intents
  targets: {
    default: {
      yes: {
        intent: null,
        value: {},
      },
      no: {
        intent: null,
        value: {},
      },
    },
    type: {
      yes: {
        intent: String,
        value: {},
      },
      no: {
        intent: String,
        value: {},
      },
    },
  },

  // the url to be used
  // whenever pushLink is
  // invoked
  url: String,
}, { timestamps: true });

contextSchema.index({ updatedAt: 1 }, { expires: "24h" });

module.exports = mongoose.model("Context", contextSchema);
