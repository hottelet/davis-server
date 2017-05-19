const dotenv = require("dotenv");
const BbPromise = require("bluebird");
const mongoose = require("mongoose");

dotenv.config();
process.env.test = true;
process.env.DAVIS_LOG_LEVEL = "error";

const AliasModel = require("../src/lib/models/alias");
const UserModel = require("../src/lib/models/user");
const TenantModel = require("../src/lib/models/tenant");
const FilterModel = require("../src/lib/models/filter");

global.Promise = BbPromise;
mongoose.Promise = BbPromise;

// Set up MongoDB Connection
before(() => {
  if (mongoose.connection.readyState === 0) {
    return mongoose.connect("localhost/davis-ng-test")
      .then(dropAll)
      .catch((err) => {
        throw new Error("Cannot connect to MongoDB");
      });
  }
});

// Drop all collections after each run
afterEach(dropAll);

after(() => {
  return mongoose.disconnect();
});

async function dropAll() {
  return Promise.all([
    UserModel.remove().exec(),
    AliasModel.remove().exec(),
    TenantModel.remove().exec(),
    FilterModel.remove().exec(),
  ]);
}

require("./users");
require("./tenants");
require("./aliases");
require("./filters");
require("./builder");
require("./dynatrace");
