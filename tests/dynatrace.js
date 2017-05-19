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
    expect(computed.allImpacts.length).to.equal(136);
    expect(computed.affectedApplications).to.deep.equal([
      'APPLICATION-160363DF4AFFF4A0',
      'SYNTHETIC_TEST-0000000000004C40',
      'SYNTHETIC_TEST-00000000000027D6',
      'APPLICATION-91A869F0065D216E',
      'DCRUM_APPLICATION-46EDF895CFC798E4',
      'APPLICATION-8801990608AB75DF',
      'APPLICATION-7F6ACE5C74505040',
      'MOBILE_APPLICATION-752C288D59734C79',
      'SYNTHETIC_TEST-0000000000002786'
    ]);
    expect(computed.rooted.length).to.equal(4);
    expect(computed.roots.length).to.equal(4);
    expect(computed.affectedEntities).to.deep.equal({
      'APPLICATION-160363DF4AFFF4A0': 'www.weather.easytravel.com',
      'SYNTHETIC_TEST-0000000000004C40': 'easyTravel demo booking',
      'SYNTHETIC_TEST-00000000000027D6': 'www.easytravel.com',
      'HOST-E4AB5FD52A142CFE': 'peco1-memcached-1',
      'AWS_LAMBDA_FUNCTION-4DB04EBBA494745E': 'bless',
      'AWS_LAMBDA_FUNCTION-0E89C70CF820E87E': 'dynamicDataStoreFunction',
      'APPLICATION-91A869F0065D216E': 'www.easytravelb2b.com',
      'DCRUM_APPLICATION-46EDF895CFC798E4': 'Dynatrace SAP App',
      'PROCESS_GROUP_INSTANCE-BFF8694A78269D02': 'eT-demo-2-BusinessBackend-LoadBalancer',
      'SERVICE-FE87731BAA390EFB': 'easyTravel Customer Frontend',
      'SERVICE-60AB8F3CDB5C9360': 'EasyTravelWebserver:18079',
      'APPLICATION-8801990608AB75DF': 'www.easytravel.com',
      'SERVICE-57DBC4AAD7C0463A': 'nginxForCustomerFrontend',
      'PROCESS_GROUP_INSTANCE-8C77EBDE2073DACA': 'eT-vmware-demo-2-CustomerFrontend',
      'PROCESS_GROUP_INSTANCE-B438C8C1560324B4': 'eT-vmware-demo-2-BusinessBackend',
      'APPLICATION-7F6ACE5C74505040': 'www.vmware.easytravel.com',
      'RELATIONAL_DATABASE_SERVICE-F6549EE518A05741': 'apl-et-demo-2-db-1',
      'MOBILE_APPLICATION-752C288D59734C79': 'easyTravel Demo',
      'SYNTHETIC_TEST-0000000000002786': 'www.weather.easytravel.com',
      'SERVICE-4E5D0A8583FDA67B': 'dotNetFrontend_easyTravel_x64:9000',
      'SERVICE-3FFC2299BB52DB02': 'EasyTravelWebserver:8999',
      'SERVICE-CCF636B5D98DB355': 'PHP on FPM pool www',
      'SERVICE-D279F46CD751424F': 'madison_island:8079' });
    expect(computed.hourly["1493276400000"][0].id).to.equal("-3839772707633434931");

    expect(computed.firstProblem.id).to.equal('3568522684534171853');
    expect(computed.lastProblem.id).to.equal('-3839772707633434931');
    expect(computed.openProblems.length).to.equal(0);
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
