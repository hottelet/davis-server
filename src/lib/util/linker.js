const moment = require("moment");

class Linker {
  static problem(user, pid) {
    return `${user.dynatraceUrl}/#problems;filter=watched/problemdetails;pid=${pid};cacheBust=${moment().valueOf()}`;
  }

  static duration(user, duration) {
    const start = moment().subtract(moment.duration(duration)).valueOf();
    const end = moment().valueOf();
    return this.range(user, start, end);
  }

  static range(user, start, end) {
    return `${user.dynatraceUrl}/#problems;gtf=c_${start}_${end}`;
  }
}

module.exports = Linker;
