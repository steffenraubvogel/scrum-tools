import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "dist/server.js",
  output: {
    file: "dist/bundle.js",
    format: "cjs",
  },
  plugins: [nodeResolve({ preferBuiltins: true }), json(), commonjs()],
};
