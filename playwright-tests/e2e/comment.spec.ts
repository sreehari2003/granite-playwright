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

      await todoMethods.createComment(assignerComment, todoName);
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
      await todoMethods.createComment(assigneeComment, todoName);
      expect(await page.locator("h1").innerText()).toBe(todoName);
    });

    const taskComment = await page.$$('[data-testid="task-comment"]');

    const allComments = await Promise.all(
      taskComment.map(async element => {
        const textContent = await element.textContent();
        return textContent?.trim();
      })
    );
    // Check if both admin and user comments exist in the array
    const isAdminCommentExist = allComments.some(comment =>
      comment.includes(assignerComment.trim())
    );
    const isUserCommentExist = allComments.some(comment =>
      comment.includes(assigneeComment.trim())
    );

    // Expect both comments to be present in the array
    expect(isAdminCommentExist && isUserCommentExist).toBe(true);
  });
});
