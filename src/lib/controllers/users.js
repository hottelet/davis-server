const bcrypt = require("bcrypt");
const UserModel = require("../models/user");

const DError = require("../core/error");
const logger = require("../core/logger");

const MINIMUM_PASSWORD_LENGTH = 6;

/**
 * User controller
 *
 * @class Users
 */
class Users {
  /**
   * Get a list of all users
   *
   * @static
   * @returns {Promise<IUserModel[]>}
   *
   * @memberOf Users
   */
  static async getAll() {
    return UserModel.find({});
  }

  static async getByEmail(email) {
    return UserModel.findOne({ email });
  }

  /**
   * Get a user by MongoID
   *
   * @static
   * @param {string} id
   * @returns {Promise<IUserModel>}
   *
   * @memberOf Users
   */
  static async getById(id) {
    return UserModel.findById(id);
  }

  /**
   * Sets the specified tenant to the user.  This assumes the user's permission has already been checked.
   *
   * @static
   * @param {any} userId - Mongoose user ID
   * @param {any} tenantId - Mongoose tenant ID
   * @returns
   *
   * @memberof Users
   */
  static async setCurrentTenant(userId, tenantId) {
    const user = await UserModel.findById(userId);
    logger.debug({ user }, `Attempting to change the tenant from '${user.tenant}' to '${tenantId}'.`);
    user.tenant = tenantId;
    return user.save();
  }

  /**
   * Create a new user
   *
   * @static
   * @param {IUser} user
   * @returns {Promise<IUserModel>}
   *
   * @memberOf Users
   */
  static async create(user) {
    if (user.password.length < MINIMUM_PASSWORD_LENGTH) {
      throw new DError(`Passwords must be at least ${MINIMUM_PASSWORD_LENGTH} characters!`, 400);
    }

    const checkUser = await UserModel.findOne({ email: user.email }).select("_id");

    if (checkUser) {
      throw new DError("User already exists!", 400);
    }

    user.password = await bcrypt.hash(user.password, 10);
    const model = new UserModel(user);
    return model.save();
  }

  /**
   * Log in a user
   *
   * @static
   * @param {string} email
   * @param {string} password
   * @returns {(Promise<IUserModel | null>)}
   *
   * @memberOf Users
   */
  static async logIn(email, password) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select("_id email password");

    if (!user) {
      return null;
    }

    const valid = await user.checkPass(password);

    if (valid) {
      return user;
    }
    return null;
  }
}

module.exports = Users;
