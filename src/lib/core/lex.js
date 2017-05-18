const aws = require("aws-sdk");
const crypto = require("crypto");
const _ = require("lodash");
const logger = require("./logger");
const timer = require("../util").timer;
const DError = require("./error");

const LexModelBuildingService = aws.LexModelBuildingService;
const LexRuntime = aws.LexRuntime;

/**
 * Static class for interacting with lex
 *
 * @class Lex
 */
class Lex {
  /**
   * Get an instance of the singleton
   *
   * @static
   * @returns
   *
   * @memberOf Lex
   */
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    return new Lex();
  }

  /**
   * Creates an instance of Lex.
   *
   *
   * @memberOf Lex
   */
  constructor() {
    this.lexModelBuildingService = new LexModelBuildingService({
      apiVersion: "2017-04-19",
      region: process.env.LEX_REGION || "us-east-1",
    });
    this.lexRuntime = new LexRuntime({
      apiVersion: process.env.LEX_API_VERSION || "2016-11-28",
      region: process.env.LEX_REGION || "us-east-1",
    });
    this.name = process.env.LEX_NAME;
    this.alias = process.env.LEX_ALIAS;
  }

  /**
   * Exports the current Lex configuration for Alexa
   *
   * This performs a best effort (and possibly fragile) export
   * of the Lex config.  It also does export confirmation prompts
   * on intents although that would be easy to add.
   *
   * @returns {Object} AlexaConf
   *
   * @memberof Lex
   */
  async lexToAlexa() {
    const bot = await this.getBot();
    const alexaConfig = { prompts: [] };
    const customSlots = {};
    const intents = await Promise.all(bot.intents.map(i =>
      this.getIntent(i.intentName, i.intentVersion)));

    alexaConfig.intents = intents.map((i) => {
      const intent = {
        // Parent intent signature is only on Amazon provided intents
        name: i.parentIntentSignature || i.name,
        samples: i.sampleUtterances,
      };

      intent.slots = _.orderBy(i.slots, "priority").map((s) => {
        // Saving unique custom slot types
        if (!_.startsWith(s.slotType, "AMAZON.")) customSlots[s.slotType] = s.slotTypeVersion;
        const slot = {
          name: s.name,
          type: s.slotType,
          samples: s.sampleUtterances,
        };
        return slot;
      });
      return intent;
    });

    alexaConfig.dialog = {
      version: "1.0",
      // Filtering out Amazon created intents
      intents: intents.filter(i => !i.parentIntentSignature).map((i) => {
        const intent = {
          name: i.name,
          confirmationRequired: false, // Must be changed in the future to support confirmation prompts
          prompts: {}, // Used only when confirmation required is true
        };
        intent.slots = _.orderBy(i.slots, "priority").map((s) => {
          // Builds the Alexa specific elicit name.  Undefined is used so the slot prompt is empty if there's no constraint.
          const elicit = (s.slotConstraint === "Required") ?
            `Elicit.Intent-${i.name}.IntentSlot-${s.name}` : undefined;

          if (elicit) {
            alexaConfig.prompts.push({
              id: elicit,
              promptVersion: "1.0",
              definitionVersion: "1.0",
              variations: [
                {
                  type: s.valueElicitationPrompt.messages[0].contentType,
                  value: s.valueElicitationPrompt.messages[0].content,
                },
              ],
            });
          }

          const slot = {
            name: s.name,
            type: s.slotType,
            elicitationRequired: Boolean(elicit),
            confirmationRequired: false,  // Must be changed if we ever add support for confirmed slots
            prompts: {
              elicit,  // Must be extended if confirmation required is true
            },
          };
          return slot;
        });
        return intent;
      }),
    };

    const expandedSlots = [];
    const types = await Promise.all(_.map(customSlots, (v, k) => this.getSlotType(k, v)));
    alexaConfig.types = types.filter((t) => {
      /*
         Uses slots with the description "expand" to extend the phrase list.
         It's a simply way to add a large number of phrases.  The slot is then
         removed from ths list so Alexa doesn't complain.
      */
      if (t.description === "expand") {
        expandedSlots.push(t.name);
        _.forEach(alexaConfig.intents, (intent, idx) => {
          const newSamples = [];
          const slot = _.find(intent.slots, { type: t.name });
          if (!slot) return;
          _.forEach(intent.samples, (sample) => {
            if (sample.includes(`{${slot.name}}`)) {
              _.forEach(t.enumerationValues, (eV) => {
                newSamples.push(sample.replace(`{${slot.name}}`, eV.value));
              });
            } else {
              newSamples.push(sample);
            }
          });
          alexaConfig.intents[idx].slots = _.filter(alexaConfig.intents[idx].slots, s =>
            s.type !== slot.type);
          alexaConfig.intents[idx].samples = newSamples;
        });
        return false;
      }
      return true;
    }).map((t) => {
      const type = {
        name: t.name,
        values: t.enumerationValues.map((v) => {
          const value = {
            name: {
              value: v.value,
            },
          };
          return value;
        }),
      };
      return type;
    });

    _.forEach(alexaConfig.dialog.intents, (intent, idx) => {
      const newSlots = _.filter(intent.slots, slot => expandedSlots.indexOf(slot.type) === -1);
      alexaConfig.dialog.intents[idx].slots = newSlots;
    });
    return alexaConfig;
  }

  /**
   * Get a JSON representation of a Lex bot from the model building service
   *
   * @returns {Promise<LexModelBuildingService.GetBotResponse>}
   *
   * @memberOf Lex
   */
  async getBot() {
    const data = await new Promise((resolve, reject) => {
      this.lexModelBuildingService.getBot({
        name: process.env.LEX_NAME,
        versionOrAlias: process.env.LEX_ALIAS,
      }, (err, lexResponse) => {
        if (err) {
          logger.error({ err });
          reject(err);
        } else {
          resolve(lexResponse);
        }
      });
    });

    return data;
  }

  /**
   * Get a JSON representation of a Lex intent from the model building service
   *
   * @param {string} name
   * @param {string} version
   * @returns {Promise<LexModelBuildingService.GetIntentResponse>}
   *
   * @memberOf Lex
   */
  async getIntent(name, version) {
    const data = await new Promise((resolve, reject) => {
      this.lexModelBuildingService.getIntent({
        name,
        version,
      }, (err, lexResponse) => {
        if (err) {
          logger.error({ err });
          reject(err);
        } else {
          resolve(lexResponse);
        }
      });
    });

    return data;
  }

  /**
   * Get a JSON representation of a Lex slot from the model building service
   *
   * @param {string} name
   * @param {string} version
   * @returns {Promise<LexModelBuildingService.GetSlotTypeResponse>}
   *
   * @memberOf Lex
   */
  async getSlotType(name, version) {
    const data = await new Promise((resolve, reject) => {
      this.lexModelBuildingService.getSlotType({
        name,
        version,
      }, (err, lexResponse) => {
        if (err) {
          logger.error({ err });
          reject(err);
        } else {
          resolve(lexResponse);
        }
      });
    });

    return data;
  }

  /**
   * Ask a Lex bot a question
   *
   * @param {string} inp
   * @param {string} scope
   * @returns {Promise<LexRuntime.PostTextResponse>}
   *
   * @memberOf Lex
   */
  async ask(inp, scope) {
    logger.info(`Asking Lex: ${inp}`);
    const lexRequestTimer = timer();
    const userId = await crypto.createHash("sha256").update(scope, "utf8").digest("hex");
    const data = await new Promise((resolve, reject) => {
      this.lexRuntime.postText({
        botAlias: this.alias,
        botName: this.name,
        inputText: inp,
        userId,
      }, (err, lexResponse) => {
        if (err) {
          logger.error({ err });
          if (err.code === "AccessDeniedException") {
            reject(new DError("Davis hasn't been authorized to use Lex!"));
          }
          reject(err);
        }
        logger.debug(`Lex responded in ${lexRequestTimer()} ms`);
        resolve(lexResponse);
      });
    });

    return data;
  }
}

module.exports = Lex.getInstance();
