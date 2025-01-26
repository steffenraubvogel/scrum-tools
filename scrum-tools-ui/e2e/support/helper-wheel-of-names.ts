import { Page } from "@playwright/test";

/**
 * Helpers to prepare a test case or assert something.
 */
export class WheelOfNamesTestHelper {
  constructor(private readonly page: Page) {}

  public async prepareNames(items: { name: string; color: number }[]) {
    const urlParam = btoa(
      JSON.stringify({
        v: 1,
        i: items.map((item) => ({ n: item.name, c: item.color })),
      }),
    );
    await this.page.goto("/wheel-of-names?cfg=" + urlParam);
  }
}
