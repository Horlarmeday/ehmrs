module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    // Disable Vue 3 v-for key placement rules (Vue 2 project)
    "vue/valid-v-for": "off",
    "vue/require-v-for-key": "off",
    "vue/no-template-key": "off",
    // "max-len": ["error", { "code": 360 }]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
