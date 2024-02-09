import { Page, expect } from "@playwright/test";

export class Task {
  constructor(private page: Page) {}

  async createComment(input: string) {
    await this.page.getByTestId("comments-text-field").fill(input);
    await this.page.getByTestId("comments-submit-button").click();
    const taskCommentContents = await this.page.getByTestId(
      "task-comment-content"
    );
    await expect(
      taskCommentContents.some(element => element.innerText.includes(input))
    ).toBeTruthy();
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
