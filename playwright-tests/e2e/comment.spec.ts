import { expect, chromium } from "@playwright/test";
import { test } from "../fixtures";
import { Users } from "../constants";
import { Task } from "../pom/Task";
import { Auth } from "../pom/Auth";

test.describe("comment ui", () => {
  test("comment on task as creator and assigned user", async ({
    page,
    auth,
  }) => {
    page.goto("/");
    const todoMethods = new Task(page);
    const todoName = "hello todo";

    const assignerComment = "hi i am a assigner";
    const assigneeComment = "hi i am a assignee";

    await test.step("create a new todo", async () => {
      await todoMethods.createTodo(todoName, Users.user.name);
    });

    await test.step("Go to that newly created todo info and add comment as admin", async () => {
      const latestTodo = await todoMethods.getTable(todoName);
      await latestTodo.click();
      await page.waitForResponse(response =>
        response.url().includes(todoName.trim().split(" ").join("-"))
      );

      await todoMethods.createComment(assignerComment);
      expect(await page.locator("h1").innerText()).toBe(todoName);
    });

    // creating new browserContext to login the assignee
    const browser = await chromium.launch();
    const assigneeContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const assigneePage = await assigneeContext.newPage();
    const loginPage = new Auth(assigneePage);
    const assigneeTasksPage = new Task(assigneePage);

    await test.step("Login as the assignee", async () => {
      await loginPage.login(Users.admin);
    });

    await test.step("Go to the assigned task and comment", async () => {
      const assignedUserTask = new Task(assigneePage);
      const assignedTodo = await assignedUserTask.getTable(todoName);

      await assignedTodo.click();
      await assigneePage.waitForResponse(response =>
        response.url().includes(todoName.trim().split(" ").join("-"))
      );

      await todoMethods.createComment(assigneeComment);
      expect(await assigneePage.locator("h1").innerText()).toBe(todoName);
    });

    // Close the browser after the test steps are complete
    await browser.close();
  });
});
