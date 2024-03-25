import { FullConfig } from "@playwright/test";
import { CoverageReport } from "monocart-coverage-reports";
import coverageOptions from "./coverage-report-config";

async function globalTeardown(config: FullConfig) {
  // finish the coverage report
  const mcr = new CoverageReport(coverageOptions);
  await mcr.generate();
}

export default globalTeardown;
