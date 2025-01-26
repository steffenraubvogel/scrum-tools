import { Page, expect } from "@playwright/test";
import { PlanningPokerTestHelper } from "./helper-planning-poker";
import { WheelOfNamesTestHelper } from "./helper-wheel-of-names";

/**
 * Helpers to prepare a test case or assert something.
 */
export class TestHelper {
  public planningPoker: PlanningPokerTestHelper;
  public wheelOfNames: WheelOfNamesTestHelper;

  constructor(private readonly page: Page) {
    this.planningPoker = new PlanningPokerTestHelper(page);
    this.wheelOfNames = new WheelOfNamesTestHelper(page);
  }

  /**
   * Compares the page by taking a screenshot and calculating the diff to previous
   * screenshot. See https://playwright.dev/docs/test-snapshots. Helps to prevent
   * visual regressions especially when updating depedencies with no functional
   * changes.
   *
   * @param page optional, default page taken otherwise
   */
  public async visualComparison(page?: Page) {
    const p = page ?? this.page;

    if (p.context().browser()?.browserType().name() !== "chromium") {
      // skip screenshots for other browsers than chromium
      // this reduces the amount of screenshot PNGs to be committed to Git repo
      return;
    }

    await expect(p).toHaveScreenshot({
      fullPage: true,
      mask: [p.locator("css=#version-info")],
    });
  }
}
