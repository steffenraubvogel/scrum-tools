import { CoverageReportOptions } from "monocart-coverage-reports";

// configuration of monocart coverage report, see
// https://github.com/cenfun/monocart-coverage-reports
export default {
  name: "Frontend Coverage Report",
  outputDir: "./coverage-reports",
  reports: ["v8", "console-summary"],
  entryFilter: (entry) => {
    //console.error("entryFilter:", entry.url); // uncomment to check if all relevant scripts are included
    return ["main.js", "chunk-", ".module-", ".component-"].some((s) => entry.url.includes(s));
  },
  sourceFilter: (sourcePath) => sourcePath.search(/src\//) !== -1 && sourcePath.search(/quick-test/) === -1,
} satisfies CoverageReportOptions;
