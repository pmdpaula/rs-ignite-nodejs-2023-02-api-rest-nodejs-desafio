import { app } from "../src/app";
import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import request from "supertest";
import { createUserAndGetCookieAndUserId } from "../src/utils/test/create-user-get-cookie-user-id";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npx knex migrate:rollback --all");
    execSync("npx knex migrate:latest");
  });

  it(
    "shoud get a session",
    async () => {
      await request(app.server).post("/users").send({
        name: "Pedrin",
        username: "pedrinho",
      });

      const response = await request(app.server).put("/users/session").send({
        username: "pedrinho",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty("set-cookie");
    },
    20 * 1000,
  );

  it("should create a new user", async () => {
    const response = await request(app.server).post("/users").send({
      name: "Pedrin",
      username: "pedrinho",
    });

    expect(response.statusCode).toBe(201);
  });

  it("should get a user by username", async () => {
    await request(app.server).post("/users").send({
      name: "Pedrin",
      username: "pedrinho",
    });

    const responseSession = await request(app.server).put("/users/session").send({
      username: "pedrinho",
    });

    const cookies = responseSession.get("Set-Cookie")!;

    const response = await request(app.server)
      .get("/users?username=pedrinho")
      .set("Cookie", cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toEqual("Pedrin");
  });

  it(
    "should get the user report",
    async () => {
      const { cookies } = await createUserAndGetCookieAndUserId({
        name: "Pedro",
        username: "pedrin",
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: false,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: false,
      });

      await request(app.server).post("/meals").set("Cookie", cookies).send({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        date: "2024.06.30",
        time: "12:00",
        onDiet: false,
      });

      const response = await request(app.server)
        .get("/users/report")
        .set("Cookie", cookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.totalMeals).toBe(7);
      expect(response.body.totalMealsOnDiet).toBe(4);
      expect(response.body.totalMealsOutDiet).toBe(3);
      expect(response.body.bestSequencyQty).toBe(3);
    },
    20 * 1000,
  );
});
