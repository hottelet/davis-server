"use strict";

/* eslint-disable */

module.exports = [
  require("./problem/date"),
  require("./problem/open"),
  require("./problem/range"),
  require("./problem/detail"),
  require("./problem/comment/add"),
  require("./problem/relTime"),
  require("./problem/appRelTime"),

  require("./userActivity/app"),
  require("./userActivity/general"),

  require("./userActivity/appDate"),
  require("./userActivity/appDow"),
  require("./userActivity/appRange"),
  require("./userActivity/appRelTime"),

  require("./userActivity/date"),
  require("./userActivity/dow"),
  require("./userActivity/range"),
  require("./userActivity/relTime"),

  require("./choice/numeric/first"),
  require("./choice/numeric/second"),
  require("./choice/numeric/third"),
  require("./choice/yes"),
  require("./choice/no"),

  require("./pager/show"),
  require("./pager/route"),
  require("./pager/next"),
  require("./pager/previous"),

  require("./general/thanks"),
  require("./general/launch"),
  require("./general/cancel"),
  require("./general/help"),
  require("./general/stop"),

  require("./tenant/active"),

  require("./topRoots/general"),
  require("./topRoots/app"),

  require("./lexVersionMismatch"),
];
