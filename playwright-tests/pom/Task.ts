import { Page, expect } from "@playwright/test";

export class Task {
  constructor(private page: Page) {}

  async createComment(input: string, todoName: string) {
    await this.page.getByTestId("comments-text-field").fill(input);
    await this.page.getByTestId("comments-submit-button").click();
    await this.page.waitForResponse(response =>
      response.url().includes(todoName)
    );
    const taskCommentContents = await this.page.$$(
      '[data-testid="task-comment-content"]'
    );

    // Assert that at least one element with the specified text is present
    const isTextPresent = await Promise.all(
      taskCommentContents.map(async element => {
        const textContent = await element.textContent();
        return textContent.includes(input);
      })
    );

    await expect(isTextPresent.some(result => result)).toBeTruthy();
  }
  async createTodo(task: string, assignedUser: string) {
    await this.page.getByTestId("navbar-add-todo-link").click();
    await this.page.getByTestId("form-title-field").fill(task);
    await this.page.locator(".css-2b097c-container").click();
    await this.page.locator(".css-26l3qy-menu").getByText(assignedUser).click();
    await this.page.getByTestId("form-submit-button").click();

    // post request
    await this.page.waitForResponse(response =>
      response.url().includes("tasks")
    );
    // get request
    await this.page.waitForResponse(response =>
      response.url().includes("tasks")
    );

    const tableRow = await this.getTable(task);

    expect((await this.getTable(task)).innerText).not.toBeNull();
  }

  async getTable(taskName: string) {
    return await this.page
      .getByTestId("tasks-pending-table")
      .getByRole("row", {
        name: taskName,
      })
      .getByRole("cell", {
        name: taskName,
      });
  }
}
