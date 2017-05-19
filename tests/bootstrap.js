
const UserController = require("../src/lib/controllers/users");
const TenantController = require("../src/lib/controllers/tenants");

const tenantSpec = {
  url: process.env.DYNATRACE_URL,
  name: "Mocha Tenant",
  access: {
    active: 0,
    tokens: ["fakeToken"],
  }
}

const userSpec = {
  email: "test@test.test",
  firstName: "Test",
  lastName: "McTesterson",
  password: "testpass",
  timezone: "Etc/UTC",
};

const appAliasSpec = {
  entityId: "APPLICATION-59CA712F666CD24D",
  aliases: ["An app"],
  display: {
    audible: "Say something about this app",
    visual: "Show something about this app",
  },
}

const serviceAliasSpec = {
  entityId: "SERVICE-227B75F33518E258",
  aliases: ["A service"],
  display: {
    audible: "Say something about this service",
    visual: "Show something about this service",
  },
}

const createUser = async () => {
  return UserController.create(userSpec);
}

const createTenant = async (user) => {
  return TenantController.create(user, tenantSpec);
}

const createUserWithTenant = async () => {
  const newUser = await createUser();
  const tenant = await createTenant(newUser);
  const user = await UserController.getById(newUser._id);
  return {
    user,
    tenant,
  }
}

const createMockRequest = async () => {
  const { user, tenant } = await createUserWithTenant();
  const req = {
    user,
    scope: `${tenant._id}:test`,
  };
  return req;
}

module.exports = {
  createUser,
  createTenant,
  createUserWithTenant,
  createMockRequest,
  tenantSpec,
  userSpec,
  appAliasSpec,
  serviceAliasSpec,
};