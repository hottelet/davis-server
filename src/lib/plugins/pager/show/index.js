"use strict";

const Plugin = require("../../../core/plugin");
const sb = require("../../../util/builder").sb;

class ShowPage extends Plugin {
  constructor() {
    super(...arguments);
    this.name = "davisPagerShow";
  }

  async ask(req) {
    req.context.set("paging.active", -1);
    const paging = req.context.paging;
    const first = paging.page * 3;
    const numPages = Math.ceil(paging.items.length / 3);

    const currentPage = paging.items.slice(first, first + 3);
    const ret = await ((currentPage.length === 0) ? { text: sb(req.user).s("Oh no! It appears that the pager had an error") } :
      (currentPage.length === 1) ? this.oneItem(req, currentPage) :
      (currentPage.length === 2) ? this.twoItems(req, currentPage) :
      this.threeItems(req, currentPage));

    if (paging.page + 1 < numPages) {
      ret.text.s("You can also say next page.");
    }
    return ret;
  }

  async oneItem(req, page) {
    const item = await this.davis.plugins[page[0].source].listItem(req, page[0].id);
    const text = sb(req.user)
      .s("This is").s(item.text).p.s("Would you like to hear more details?");

    return {
      text,
      targets: {
        yes: {
          intent: "pageRoute",
          value: item,
        },
      },
    };
  }

  async twoItems(req, page) {
    const items = await Promise.all(page.map(i =>
      this.davis.plugins[i.source].listItem(req, i.id)));
    return {
      text: sb(req.user).s("There was").s(items[0].text).s("and").s(items[1].text).p
        .s("Would you like to know more about the first, or second one?"),
    };
  }

  async threeItems(req, page) {
    const items = await Promise.all(page.map(i =>
      this.davis.plugins[i.source].listItem(req, i.id)));
    return {
      text: sb(req.user).s("First, there").s("is", "was", items[0].value.status === "OPEN")
      .s(items[0].text).p.s("Second, there was").s(items[1].text).p.s("Finally, there")
      .s("is", "was", items[2].value.status === "OPEN").s(items[2].text).p
      .s("Would you like to know more about the first, second, or third one?"),
    };
  }
}

module.exports = ShowPage;
