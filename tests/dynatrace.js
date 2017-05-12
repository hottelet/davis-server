const expect = require("chai").expect;
const Util = require("../src/lib/util");
const { problems, stats } = require("./data/problemFeed");

describe("Dynatrace", () => {
  it("should convert ISO 8601 ranges to appropriate dynatrace relative ranges", () => {
    const hour = Util.Dynatrace.rangeToRelativeTime("PT48M");
    const twohour = Util.Dynatrace.rangeToRelativeTime("PT1H48M");
    const sixhour = Util.Dynatrace.rangeToRelativeTime("PT3H48M");
    const day = Util.Dynatrace.rangeToRelativeTime("PT8H48M");
    const week = Util.Dynatrace.rangeToRelativeTime("P3DT5H48M");
    const month = Util.Dynatrace.rangeToRelativeTime("P12DT48M");

    expect(hour).to.equal("hour");
    expect(twohour).to.equal("2hours");
    expect(sixhour).to.equal("6hours");
    expect(day).to.equal("day");
    expect(week).to.equal("week");
    expect(month).to.equal("month");
  });

  it("should compute stats about problems from the feed", () => {
    const computed = Util.Dynatrace.problemStats(problems);
    expect(computed).to.deep.equal(stats);
  });
});
