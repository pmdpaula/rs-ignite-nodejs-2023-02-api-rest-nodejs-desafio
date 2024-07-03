import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createUserAndGetCookieAndUserId } from "./create-user-get-cookie-user-id";
import { app } from "../../app";
import { execSync } from "child_process";

describe.skip("Test function createUserAndGetCookieAndUserId", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npx knex migrate:rollback --all");
    execSync("npx knex migrate:latest");
  });

  it("should create a new user and return the cookies and userId", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    expect(cookies[0]).toContain("sessionId=");
    expect(cookies[1]).toContain("userId=");
    expect(userId).toEqual(expect.any(String));
  });
});
