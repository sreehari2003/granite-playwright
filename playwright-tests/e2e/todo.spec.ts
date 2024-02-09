import { expect, test } from "@playwright/test";
import { Users } from "../constants";
import { Task } from "../pom/Task";
import { faker } from "@faker-js/faker";

test.describe("Todo creations and associated features", () => {
  let taskName: string;
  test.beforeEach(async ({ page }) => {
    taskName = faker.word.verb(5);
  });

  test("should login as an assignee and assign another user a task", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");
    const assigneeUser = Users.admin;
    const taskMethods = new Task(page);
    console.log(taskName);
    await taskMethods.createTodo(taskName, Users.user.name);
  });
});
