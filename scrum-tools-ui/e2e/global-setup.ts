import { type FullConfig } from "@playwright/test";
import { CoverageReport } from "monocart-coverage-reports";
import coverageOptions from "./coverage-report-config";

async function globalSetup(config: FullConfig) {
  // prepares the coverage analysis
  const mcr = new CoverageReport(coverageOptions);
  mcr.cleanCache();
}

export default globalSetup;
