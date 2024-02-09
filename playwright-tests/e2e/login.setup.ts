// login.spec.ts

import { expect } from "@playwright/test";
import { test } from "../fixtures";
import { Users } from "../constants";
import { STORAGE_STATE } from "../playwright.config";

test.describe("Authentication", () => {
  const loginUser = Users.user;

  test("should login with the correct credentials", async ({ page, auth }) => {
    await page.goto("http://localhost:3000");
    await auth.login(loginUser);
    await expect(page.getByTestId("navbar-username-label")).toBeVisible();
    await expect(page.getByTestId("navbar-logout-link")).toBeVisible();

    await page.context().storageState({ path: STORAGE_STATE });
  });
});
