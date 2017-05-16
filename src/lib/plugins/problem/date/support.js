"use strict";

const support = require("../support");

support.examples.push(
  [
    {
      request: {
        text: "What happened on {{DATETIME}}?",
        slotTypeValues: {
          DATETIME: "April 29th",
        },
      },
      response: {
        text: "29/04/2017, 11 problems occurred. Would you like to see a listing of these issues?",
        say: "29/04/2017, 11 problems occurred. Would you like to see a listing of these issues?",
        show: {
          text: "29/04/2017, 11 problems occurred. Would you like to see a listing of these issues?",
        },
      },
    },
    {
      request: {
        text: "Yes",
        slotTypeValues: {
        },
      },
      response: {
        text: "First, there was Javascript Error Rate Increased on www.easytravel.com. Second, there was Service Response Time Degraded on ConfigurationService. Finally, there was Openstack Keystone Slow on Keystone. Would you like to know more about the first, second, or third one? You can also say next page.",
        say: "First, there was Javascript Error Rate Increased on www.easytravel.com. Second, there was Service Response Time Degraded on ConfigurationService. Finally, there was Openstack Keystone Slow on Keystone. Would you like to know more about the first, second, or third one? You can also say next page.",
        show: {
          text: "First, there was Javascript Error Rate Increased on www.easytravel.com. Second, there was Service Response Time Degraded on ConfigurationService. Finally, there was Openstack Keystone Slow on Keystone. Would you like to know more about the first, second, or third one? You can also say next page.",
        },
      },
    },
  ] // eslint-disable-line comma-dangle
);

module.exports = support;
