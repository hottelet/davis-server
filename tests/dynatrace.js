const expect = require("chai").expect;
const Util = require("../src/lib/util");
const { problems, stats } = require("./data/problemFeed");
const userActivity = require("./data/userActivity");

const { userSpec } = require("./bootstrap");
const UsersController = require("../src/lib/controllers/users");

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

  it("should summarize a list of problems", async () => {
    const user = await UsersController.create(userSpec);
    const summary = await Util.Dynatrace.summarize(user, problems).toString();
    expect(summary).to.equal("The most affected application was www.easytravel.com, which was affected by 20 issues. The largest concentration of problems was around 04/24/2017 at 10:00 PM.");
  });

  it("should compute stats about user activity", async () => {
    const computed = Util.Dynatrace.userActivityStats(userActivity);

    expect(computed.topApp).to.equal("APPLICATION-884BE7FEA3CE14B6");
    expect(computed.topAppMax[0]).to.equal(1494802800000);
    expect(computed.topAppMax[1]).to.equal(318);
    expect(computed.topAppMean).to.equal(223);
  });
});
