"use strict";

const Plugin = require("../../../core/plugin");

class Previous extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisPagerPrevious";
  }

  async ask(req) {
    const paging = req.context.paging;
    const active = paging.active;

    if (active === -1) {
      return this.previousPage(req);
    }
    return this.previousItem(req);
  }

  async previousPage(req) {
    const paging = req.context.paging;
    if (paging.page === 0) {
      return { text: "You are already on the first page" };
    }
    req.context.set("paging.page", paging.page - 1);
    return this.davis.plugins.davisPagerShow.run(req);
  }

  async previousItem(req) {
    const paging = req.context.paging;
    const active = paging.active;
    const next = active - 1;

    if (active === 0) {
      return { text: "You are already on the first item" };
    }
    req.context.set("paging.active", next);
    const item = paging.items[next];
    return this.davis.plugins[item.target]._yes(req, item.id);
  }
}

module.exports = Previous;
