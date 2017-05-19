const expect = require("chai").expect;
const _ = require("lodash");
const nock = require("nock");

const FilterController = require("../src/lib/controllers/filters");
const Dynatrace = require("../src/lib/core/dynatrace");

const { createMockRequest } = require("./bootstrap");
const { problems } = require("./data/problemFeed");

describe("Filters", () => {
  let req;
  beforeEach(async () => {
    req = await createMockRequest();
  });

  after(() => nock.cleanAll());

  it("should reject new filter due to a missing name", async () => {
    try{
      await FilterController.create(req.user, {});
    } catch (err) {
      expect(err.message).to.equal("A filter name is required!");
      return;
    }
    throw new Error("Should have failed due to a filter name!");
  });

  it("should create a new global filter", async () => {
    const entityId = "APPLICATION-160363DF4AFFF4A0";
    const filter = await FilterController.create(req.user, { name: "test filter", entity: [entityId]});
    const confFilter = await FilterController.getById(filter._id);
    expect(confFilter.entity[0]).to.equal(entityId);
  });

  it("should filter problems by an entity id", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    const entityId = "APPLICATION-160363DF4AFFF4A0";
    await FilterController.create(req.user, { name: "test filter", entity: [entityId]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(14);
  });

  it("should filter problems by status", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", status: "OPEN"});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(1);
  });

  it("should filter problems by impact", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});
    await FilterController.create(req.user, { name: "test filter", impact: ["INFRASTRUCTURE"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });
    expect(filteredList.length).to.equal(5);
  });

  it("should filter problems by severity level", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", severityLevel: ["ERROR", "PERFORMANCE"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(28);
  });

  it("should filter problems by tag", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", tags: { includes: ["easyTravel"] }});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(37);
  });

  it("should filter problems by tags", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", tags: { includes: ["easyTravel", "Weather"] }});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(14);
  });

  it("should filter problems by excluded tag", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", tags: { excludes: ["Weather"] }});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(65);
  });

  it("should filter problems by excluded tag", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", tags: { includes: ["easyTravel"], excludes: ["Weather"] }});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(23);
  });

  it("should filter problems by excluded event types", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", excludeEventType: ["UNEXPECTED_LOW_LOAD"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(61);
  });

  it("should filter problems by multiple criteria", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", impact: ["SERVICE"], status: ["CLOSED"], severityLevel: ["PERFORMANCE"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(2);
  });

  it("should filter problems by multiple filters", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter", impact: ["SERVICE"], status: ["CLOSED"], severityLevel: ["PERFORMANCE"]});
    await FilterController.create(req.user, { name: "test filter 2", impact: ["INFRASTRUCTURE"], status: ["CLOSED"], severityLevel: ["AVAILABILITY"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(3);
  });

  it("should filter problems using scope filter", async () => {
    nock(/dynatrace/i)
      .get("/api/v1/problem/feed")
      .query({
        relativeTime: "hour",
      })
      .reply(200, { result: { problems }});

    await FilterController.create(req.user, { name: "test filter general", impact: ["SERVICE"], status: ["CLOSED"], severityLevel: ["PERFORMANCE"]});
    await FilterController.create(req.user, { name: "test filter filter", scope: req.scope, impact: ["INFRASTRUCTURE"], status: ["CLOSED"], severityLevel: ["AVAILABILITY"]});
    const filteredList = await Dynatrace.getFilteredProblems(req, { relativeTime: "hour" });

    expect(filteredList.length).to.equal(1);
  });
});
