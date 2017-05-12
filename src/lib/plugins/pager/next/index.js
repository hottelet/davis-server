"use strict";

const Plugin = require("../../../core/plugin");

class Next extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisPagerNext";
  }

  async ask(req) {
    const paging = req.context.paging;
    const active = paging.active;

    if (active === -1) {
      return this.nextPage(req);
    }
    return this.nextItem(req);
  }

  async nextPage(req) {
    const paging = req.context.paging;
    const page = paging.page;
    const first = page * 3;
    const total = paging.items.length;
    if (first + 3 >= total) {
      return { text: "You are already on the last page" };
    }
    req.context.set("paging.page", paging.page + 1);
    return this.davis.plugins.davisPagerShow.run(req);
  }

  async nextItem(req) {
    const paging = req.context.paging;
    const active = paging.active;
    const next = active + 1;
    const total = paging.items.length;
    if (active >= total - 1) {
      return { text: "You are already on the last item" };
    }
    req.context.set("paging.active", next);
    const item = paging.items[next];
    return this.davis.plugins[item.target]._yes(req, item.id);
  }
}

module.exports = Next;
