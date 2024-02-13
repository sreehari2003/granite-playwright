//comments-spec.ts
import { Browser, Page, expect } from "@playwright/test";
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

  test.beforeEach(({ page }) => {
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

    await test.step("step 1 - create a new task by assigner", () =>
      taskPage.createTaskAndVerify({
        taskName: todoName,
        userName: "Sam Smith",
      }));

    await test.step("step 2 - go to that newely created task", async () => {
      await page.getByTestId("tasks-pending-table").getByText(todoName).click();

      const endPoint = todoName.replace(/\s+/g, "-");

      await page.waitForResponse(response => response.url().includes(endPoint));
      expect(await page.locator("h1")).toHaveText(todoName);
    });

    await test.step("step 3 - create comment as assigner in the todo and verify", () =>
      taskPage.createCommentAndVerify({
        comment: assignerComment,
        taskName: todoName,
      }));

    await test.step("step 4 - check if comment count was increased for the task", () =>
      taskPage.checkForCount({
        taskName: todoName,
        count: 1,
      }));

    let assigneeContext: Browser;
    let assigneePage: Page;
    let assigneeTasks: TaskPage;
    let assigneeAuth: LoginPage;

    await test.step("step 5 - create new browser window", async () => {
      assigneeContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });

      assigneePage = await assigneeContext.newPage();
      assigneeAuth = new LoginPage(assigneePage);
      assigneeTasks = new TaskPage(assigneePage);
    });

    await test.step("step 5  - Login as assigned user and go to the specified task", async () => {
      await assigneePage.goto("/");
      await assigneeAuth.loginAndVerifyUser(Users.user);
      await assigneePage
        .getByTestId("tasks-pending-table")
        .getByText(todoName)
        .click();

      const endPoint = todoName.replace(/\s+/g, "-");

      await assigneePage.waitForResponse(response =>
        response.url().includes(endPoint)
      );
      expect(await assigneePage.locator("h1").innerText()).toBe(todoName);
    });

    await test.step("step 6 - Create comment as assigned user", () =>
      assigneeTasks.createCommentAndVerify({
        comment: assigneeComment,
        taskName: todoName,
      }));

    await test.step("step 6 - check for comment count", () =>
      assigneeTasks.checkForCount({
        taskName: todoName,
        count: 2,
      }));

    assigneePage.close();
    assigneeContext.close();
  });
});
