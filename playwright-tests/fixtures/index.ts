import { test as base } from "@playwright/test";
import { Auth } from "../pom/Auth";

interface Props {
  auth: Auth;
}

export const test = base.extend<Props>({
  auth: async ({ page }, use) => {
    const auth = new Auth(page);
    await use(auth);
  },
});
