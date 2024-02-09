import { Page, expect } from "@playwright/test";

type AuthProps = {
  email: string;
  password: string;
};

export class Auth {
  constructor(private page: Page) {}

  async login({ email, password }: AuthProps) {
    await this.page.getByTestId("login-email-field").fill(email);
    await this.page.getByTestId("login-password-field").fill(password);
    await this.page.getByTestId("login-submit-button").click();
    await expect(this.page.getByTestId("navbar-logout-link")).toBeVisible();
  }

  async logOut() {
    await this.page.getByTestId("navbar-logout-link").click();
  }
}
