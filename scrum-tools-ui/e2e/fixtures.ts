import { test as playwright } from "@playwright/test";
import { CoverageReport } from "monocart-coverage-reports";
import coverageOptions from "./coverage-report-config";
import { TestHelper } from "./support/helper";
import { Locators } from "./support/locators";

const test = playwright.extend<{ locators: Locators; helper: TestHelper; customize: void }>({
  locators: async ({ page }, use) => {
    await use(new Locators(page));
  },
  helper: async ({ page }, use) => {
    await use(new TestHelper(page));
  },
  customize: [
    async ({ page }, use) => {
      const isChromium = test.info().project.name === "chromium";
      if (isChromium) {
        // playwright coverage only supported in chromium for now
        page.coverage.startJSCoverage();
      }

      // go to app and clear local storage
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());

      // call actual test
      await use();

      // evaluate coverage
      if (isChromium) {
        const coverage = await page.coverage.stopJSCoverage();

        const coverageReport = new CoverageReport(coverageOptions);
        await coverageReport.add(coverage);
      }
    },
    { auto: true },
  ],
});

export default test;
