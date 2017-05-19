"use strict";

const support = {
  name: "problem",
  title: "Investigate problems with applications",
  description: "Get an overview of all open and closed problems that occurred during a specific time frame. Filter in problems by application name and time frame. Optionally, users can flip through pages of problems and get more details for each problem.",
  tip: "Define the time frame by specifying a date, time, day of the week, date range or time range. Yesterday, last night, this morning, this afternoon, and other relative time frames are also supported. Time frames are automatically adjusted to only include the past.<br><br>Filter results to only include problems associated with a specific application. While davis can recognize some misspelled or misheard application names, users can improve interactions involving complex application names by adding aliases for applications (or other entities) in the Entities section within Account Settings.",
  createdTimestamp: 1494815400,
  updatedTimestamp: 1494815400,
  hasRemoteNavigation: true,
  slotTypes: [
    "APP",
    "DATETIME",
  ],
  arrivalPluginNames: [],
  departurePluginNames: ["problemDetails"],
  examples: [],
};

module.exports = support;
