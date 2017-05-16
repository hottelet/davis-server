"use strict";

const Plugin = require("../../../core/plugin");
const Dynatrace = require("../../../core/dynatrace");
const sb = require("../../../util/builder").sb;

/**
 * Plugin to fall back on if Lex returns an intent that is not implemented
 *
 * @class ProblemCommentAdd
 * @extends {Plugin}
 */
class ProblemCommentAdd extends Plugin {
  /**
   * Creates an instance of ProblemCommentAdd.
   *
   *
   * @memberOf ProblemCommentAdd
   */
  constructor() {
    super(...arguments);
    this.name = "davisProblemCommentAdd";
  }

  /**
   * Main intent method
   *
   * @param {IDavisRequest} req
   * @returns
   *
   * @memberOf ProblemCommentAdd
   */
  async ask(req) {
    const paging = req.context.paging;
    const active = paging.active;

    if (active === -1) {
      return { text: "I'm sorry, but you don't appear to have a problem selected." };
    }

    const activeItem = paging.items[active];
    const pid = activeItem.id;

    const comment = req.slots.commentText;

    await Dynatrace.addCommentToProblem(req.user, pid, comment);

    return {
      text: sb(req.user).s("Added your comment: ").s(comment).p,
    };
  }
}

module.exports = ProblemCommentAdd;
