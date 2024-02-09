import { expect, chromium, test } from "@playwright/test";
import { Users } from "../constants";
import { Task } from "../pom/Task";
import { Auth } from "../pom/Auth";

test.describe("comment ui", () => {
  test("comment on task  as creator and assigned user", async ({ page }) => {
    const todoMethods = new Task(page);

    const todoName = "hello todo";

    const assignerComment = "hi i am a assigner";
    const assigneeComment = "hi i am a assignee";

    test.step("create a new todo", async () => {
      await todoMethods.createTodo(todoName, Users.user.name);
    });
    test.step("Go to that newly created todo info", async () => {
      const latestTodo = await todoMethods.getTable(todoName);
      await latestTodo.click();
      await page.waitForResponse(response =>
        response.url().includes(todoName.trim().split(" ").join("-"))
      );

      expect(await page.locator("h1").innerText).toBe(todoName);
    });

    const browser = await chromium.launch();
    const assigneeContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const assigneePage = await assigneeContext.newPage();
    const loginPage = new Auth(assigneePage);
    const assigneeTasksPage = new Task(assigneePage);

    await test.step("Login as the assignee", async () => {
      await assigneePage.goto("/");
      await loginPage.login(Users.admin);
    });
  });
});
