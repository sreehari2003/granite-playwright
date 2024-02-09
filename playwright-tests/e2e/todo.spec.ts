import { expect, test } from "@playwright/test";
import { Users } from "../constants";
import { Task } from "../pom/Task";

test.describe("Todo creations and associated features", () => {
  test("should login as an assignee and assign another user a task", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");
    const assigneeUser = Users.admin;
    const taskMethods = new Task(page);

    await taskMethods.createTodo("this is a todo", Users.user.name);
  });
});
