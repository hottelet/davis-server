module.exports = {
  "extends": "airbnb",
  "plugins": [],
  "rules": {
    "no-param-reassign": [2, { "props": false }],
    "no-underscore-dangle": "off",
    "new-cap": "off",
    "func-names": "off",
    "strict": "off",
    "prefer-rest-params": "off",
    "react/require-extension" : "off",
    "import/no-extraneous-dependencies" : "off",
    "max-len": ["error", {
      "code": 100,
      "ignoreComments": true,
      "ignoreTrailingComments": true,
      "ignoreUrls": true,
      "ignoreStrings": true,
      "ignoreTemplateLiterals": true
    }]
  },
  "env": {
       "mocha": true
   }
};
