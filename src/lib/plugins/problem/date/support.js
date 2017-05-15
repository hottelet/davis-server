"use strict";

const Plugin = require("../../../core/plugin");

class Support extends Plugin {
  constructor() {
    super(...arguments);
    this.support = {
      name: 'problem',
      title: 'Problem',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque interdum mollis nibh at dapibus. Etiam eleifend lectus in ullamcorper volutpat. Vestibulum posuere venenatis felis at rutrum. Maecenas venenatis, sapien at cursus faucibus, quam turpis aliquam elit, id auctor risus velit vel quam.',
      tip: 'Quisque tempus hendrerit risus in tincidunt. Etiam finibus semper dui, efficitur laoreet nulla pellentesque sit amet. Donec imperdiet nisi sed placerat mollis. Curabitur laoreet sollicitudin congue. Quisque pulvinar neque quis libero condimentum condimentum non in sapien. Aliquam at cursus dolor. ',
      isNew: false,
      hasRemoteNavigation: true,
      slotTypes: [
        'APP',
        'DATETIME',
        'CONFIRMATION',
      ],
      arrivalPluginNames: [],
      departurePluginNames: ['problemDetails'],
      examples: [
        [
          {
            request: {
              text: 'What happened to {{APP}} {{DATETIME}}?',
              slotTypeValues: {
                'APP': 'easyTravel demo',
                'DATETIME': 'last week',
              },
            },
            response: {
              "audible": {
                "ssml": "<ssml>First, there was a mobile app crash rate increased on easyTravel Demo.  Second, there was a javascript error rate increased on www.easytravel.com.  Finally, there was a javascript error rate increased on www.easytravel.com.  Would you like to know more about the first, second, or third one? You can also say next.</ssml>"
              },
              "visual": {
                "text": "First, There was a mobile app crash rate increased on easyTravel Demo.  Second, There was a javascript error rate increased on www.easytravel.com.  Finally, There was a javascript error rate increased on www.easytravel.com.  Would you like to know more about the first, second, or third one? You can also say next.",
                "card": {
                  "attachments": [
                    {
                      "mrkdwn_in": [
                        "text",
                        "pretext",
                        "fields"
                      ],
                      "text": "187 total items.",
                      "footer": "Page 8 of 63",
                      "fallback": "187 total items."
                    },
                    {
                      "mrkdwn_in": [
                        "text",
                        "pretext",
                        "fields"
                      ],
                      "title": "Mobile App Crash Rate Increased on easyTravel Demo",
                      "fields": [
                        {
                          "title": "Time Frame",
                          "value": "<!date^1492894260^{date_short_pretty} {time}|last saturday at 4:51 pm> - <!date^1492897980^{date_short_pretty} {time}|last saturday at 5:53 pm>",
                          "short": false
                        },
                        {
                          "title": "Top Event",
                          "value": "An Increase In Mobile App Crashes",
                          "short": true
                        }
                      ],
                      "title_link": "https://cdojfgmpzd.live.dynatrace.com/#problems;filter=watched/problemdetails;pid=-5628033032124819179",
                      "color": "#7dc540"
                    },
                    {
                      "mrkdwn_in": [
                        "text",
                        "pretext",
                        "fields"
                      ],
                      "title": "Javascript Error Rate Increased on www.easytravel.com [Root Cause]",
                      "fields": [
                        {
                          "title": "Time Frame",
                          "value": "<!date^1492394100^{date_short_pretty} {time}|04/16/2017> - <!date^1492397340^{date_short_pretty} {time}|04/16/2017>",
                          "short": false
                        },
                        {
                          "title": "Top Event",
                          "value": "High Number Of Connectivity Failures",
                          "short": true
                        }
                      ],
                      "title_link": "https://cdojfgmpzd.live.dynatrace.com/#problems;filter=watched/problemdetails;pid=7429958552687315451",
                      "color": "#7dc540"
                    },
                    {
                      "mrkdwn_in": [
                        "text",
                        "pretext",
                        "fields"
                      ],
                      "title": "Javascript Error Rate Increased on www.easytravel.com [Root Cause]",
                      "fields": [
                        {
                          "title": "Time Frame",
                          "value": "<!date^1492646100^{date_short_pretty} {time}|04/19/2017> - <!date^1492649340^{date_short_pretty} {time}|04/19/2017>",
                          "short": false
                        },
                        {
                          "title": "Top Event",
                          "value": "High Number Of Connectivity Failures",
                          "short": true
                        }
                      ],
                      "title_link": "https://cdojfgmpzd.live.dynatrace.com/#problems;filter=watched/problemdetails;pid=1958579898720811804",
                      "color": "#7dc540"
                    },
                    {
                      "text": "Would you like to know more about the first, second, or third one?",
                      "callback_id": "pageRoute",
                      "actions": [
                        {
                          "name": "First",
                          "text": "First",
                          "value": "{\"value\":\"problemDetails:-5628033032124819179\"}",
                          "type": "button"
                        },
                        {
                          "name": "Second",
                          "text": "Second",
                          "value": "{\"value\":\"problemDetails:7429958552687315451\"}",
                          "type": "button"
                        },
                        {
                          "name": "Third",
                          "text": "Third",
                          "value": "{\"value\":\"problemDetails:1958579898720811804\"}",
                          "type": "button"
                        },
                        {
                          "name": "Previous",
                          "text": "Previous Page",
                          "value": "{\"value\":18,\"replace\":true,\"slow\":false}",
                          "type": "button"
                        },
                        {
                          "name": "Next",
                          "text": "Next Page",
                          "value": "{\"value\":24,\"replace\":true,\"slow\":false}",
                          "type": "button"
                        }
                      ]
                    }
                  ]
                }
              },
              "finished": false,
            },
          },
        ],
      ],
    };
  }
}

module.exports = Support;
