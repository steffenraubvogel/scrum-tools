import { Locator, Page, expect } from "@playwright/test";
import { Locators } from "./locators";

/**
 * Helpers to prepare a test case or assert something.
 */
export class TestHelper {
  constructor(private readonly page: Page) {}

  public async prepareSession(moderator: string = "Testmoderator", inPlace: boolean = false) {
    const targetPage = inPlace ? this.page : await this.page.context().newPage();
    const locators = new Locators(targetPage);

    await targetPage.goto("/");
    await locators.createSession.yourName.fill(moderator);
    await locators.createSession.submit.click();
    await expect(targetPage).toHaveURL(/\/session\/.*/);
    await targetPage.evaluate(() => window.localStorage.clear());

    return {
      joinUrl: "/join/" + targetPage.url().match(/\/([^/]*)$/)![1],
      page: targetPage,
      locators,
    };
  }

  public async joinSession(joinUrl: string, userName: string = "testuser1", role: "Guesser" | "Observer" = "Guesser") {
    const newPage = await this.page.context().newPage();
    const locators = new Locators(newPage);

    await newPage.goto(joinUrl);
    await locators.joinSession.yourName.fill(userName);
    await locators.joinSession.role.selectOption(role);
    await locators.joinSession.submit.click();
    await expect(newPage).toHaveURL(/\/session\/.*/);
    await newPage.evaluate(() => window.localStorage.clear());

    return {
      page: newPage,
      locators,
    };
  }

  public stackComponent(stackLocator: Locator) {
    return new StackComponentTestHelper(this.page, stackLocator);
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

class StackComponentTestHelper {
  constructor(private readonly page: Page, private readonly stackLocator: Locator) {}

  public async expectActive(stackChild: Locator) {
    await expect(this.stackLocator.locator("css=.sp-stack-active-child").locator(stackChild)).toBeVisible();
  }

  public async expectNotActive(stackChild: Locator) {
    await expect(this.stackLocator.locator("css=.sp-stack-active-child").locator(stackChild)).not.toBeVisible();
  }

  public async expectText(stackChild: Locator, text: string | RegExp) {
    await expect(this.stackLocator.locator("css=.sp-stack-active-child").locator(stackChild)).toHaveText(text);
  }
}
