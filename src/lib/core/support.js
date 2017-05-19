"use strict";

const slotTypes = {
  APP: {
    title: "Application Name",
    required: false,
    description: "Only problems associated with this application will be included in the response. If no application name is specified, all applications will be eligible to be included in the response.",
    tip: "Define aliases, as well as visual and audible versions of complex application names in the Dynatrace - Applications section within davis Settings.",
  },
  DATETIME: {
    title: "Time Frame",
    required: false,
    description: "description here",
    tip: "Specify AM/PM when filtering with an exact time",
  },
  NUMBER: {
    title: "Problem Number",
    required: true,
    description: "Select a problem from the list if more than one are present or ask for more details if only one problem is in the list. Drilling into a problem reveals details not shared within the problems list.",
    tip: "Users can drill out of problem details by using the \"Back to List\" button in Slack or saying \"Go back to the list\"",
  },
};

class Support {

  static getSlotTypes() {
    return slotTypes;
  }

  static getPlugins(davis) {
    const plugins = [];
    let prevKey = null;
    Object.keys(davis.plugins).forEach((key) => {
      if (davis.plugins[key].support && (!prevKey || !davis.plugins[prevKey].support
        || davis.plugins[prevKey].support.name !== davis.plugins[key].support.name)) {
        plugins.push(davis.plugins[key].support);
        prevKey = key;
      }
    });
    return plugins;
  }
}

module.exports = Support;
