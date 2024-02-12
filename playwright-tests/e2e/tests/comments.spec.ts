//comments-spec.ts
import { expect } from "@playwright/test";
import { test } from "../fixtures/index";
import { Users } from "../../constants";
import { TaskPage } from "../pom/tasks";
import { Auth } from "../pom/login";
import { faker } from "@faker-js/faker";
import LoginPage from "../pom/login";

test.describe("Comment Page", () => {
  let todoName: string;
  let assigneeComment: string;
  let assignerComment: string;

  test.beforeEach(async ({ page }) => {
    todoName = faker.word.verb(5);
    assigneeComment = faker.lorem.sentence();
    assignerComment = faker.lorem.sentence();
  });

  test("comment on task as creator and assigned user", async ({
    page,
    loginPage,
    browser,
    taskPage,
  }) => {
    page.goto("/");

    await test.step("step 1 - create a new task by assigner", async () => {
      await taskPage.createTaskAndVerify({
        taskName: todoName,
        userName: "Sam Smith",
      });
    });

    await test.step("step 2 - go to that newely created task", async () => {
      await page.getByTestId("tasks-pending-table").getByText(todoName).click();

      await page.waitForResponse(response =>
        response.url().includes(todoName.split(" ").join("-"))
      );
      expect(await page.locator("h1").innerText()).toBe(todoName);
    });

    await test.step("step 3 - create comment as assigner in the todo and verify", async () => {
      await taskPage.createCommentAndVerify({
        comment: assignerComment,
        taskName: todoName,
      });
    });

    const assigneeContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });

    const assigneePage = await assigneeContext.newPage();

    await test.step("step 4  - Login as assigned user and go to the specified task", async () => {
      await assigneePage.goto("/");
      const assigneeAuth = new LoginPage(assigneePage);
      await assigneeAuth.loginAndVerifyUser(Users.user);
      await assigneePage
        .getByTestId("tasks-pending-table")
        .getByText(todoName)
        .click();
      await assigneePage.waitForResponse(response =>
        response.url().includes(todoName.split(" ").join("-"))
      );
      expect(await assigneePage.locator("h1").innerText()).toBe(todoName);
    });

    await test.step("step 5 - Create comment as assigned user", async () => {
      const assigneeTasks = new TaskPage(assigneePage);
      await assigneeTasks.createCommentAndVerify({
        comment: assigneeComment,
        taskName: todoName,
      });
    });

    assigneePage.close();
    assigneeContext.close();
  });
});
