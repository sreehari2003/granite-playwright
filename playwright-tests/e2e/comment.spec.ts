import { expect } from "@playwright/test";
import { test } from "../fixtures";
import { Users } from "../constants";
import { Task } from "../pom/Task";
import { Auth } from "../pom/Auth";
import { faker } from "@faker-js/faker";

test.describe("comment ui", () => {
  let todoName: string;

  test.beforeEach(async ({ page }) => {
    todoName = faker.word.verb(5);
  });

  test("comment on task as creator and assigned user", async ({
    page,
    auth,
    browser,
  }) => {
    page.goto("/");
    const todoMethods = new Task(page);

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

    await test.step("Logout the admin and login as assigned user", async () => {
      await auth.logOut();
      await auth.login(Users.user);
    });

    await test.step("Go to the assigned task and comment", async () => {
      const assignedTodo = await todoMethods.getTable(todoName);
      await assignedTodo.click();
      await page.waitForResponse(response =>
        response.url().includes(todoName.trim().split(" ").join("-"))
      );
      await todoMethods.createComment(assigneeComment);
      expect(await page.locator("h1").innerText()).toBe(todoName);
    });

    // Close the browser after the test steps are complete
    await browser.close();
  });
});
