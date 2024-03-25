import { CoverageReportOptions } from "monocart-coverage-reports";

// configuration of monocart coverage report, see
// https://github.com/cenfun/monocart-coverage-reports
export default {
  name: "Frontend Coverage Report",
  outputDir: "./coverage-reports",
  reports: ["v8", "console-summary"],
  entryFilter: (entry) => entry.url.indexOf("main.js") !== -1,
  sourceFilter: (sourcePath) => sourcePath.search(/src\//) !== -1,
} satisfies CoverageReportOptions;
