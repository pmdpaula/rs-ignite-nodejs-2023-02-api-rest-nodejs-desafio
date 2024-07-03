import { app } from "../src/app";
import { execSync } from "child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createUserAndGetCookieAndUserId } from "../src/utils/test/create-user-get-cookie-user-id";

describe("Meals routes", () => {
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

  it("should create a new meal", async () => {
    const { cookies } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    const response = await request(app.server)
      .post("/meals")
      .set("Cookie", cookies)
      .send({
        name: "Frango",
        description: "Frango com batata",
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
      });

    expect(response.statusCode).toBe(201);
  });

  it("should get all meals from an user", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Arroz Pati",
      description: "Arroz com açafrão",
      date: "2024.06.30",
      time: "13:00",
      onDiet: true,
      userId,
    });

    const { cookies: cookies2, userId: userId2 } = await createUserAndGetCookieAndUserId({
      name: "Maria",
      username: "maria",
    });

    await request(app.server).post("/meals").set("Cookie", cookies2).send({
      name: "Arroz",
      description: "Arroz com feijão",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId: userId2,
    });

    const response = await request(app.server).get("/meals").set("Cookie", cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.meals).toHaveLength(2);
  });

  it("should get a meal by id", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const response = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies);

    expect(response.statusCode).toBe(200);
    expect(response.body.meal.name).toBe("Frango");
  });

  it("should not get a meal from another", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const { cookies: cookies2 } = await createUserAndGetCookieAndUserId({
      name: "Maria",
      username: "maria",
    });

    const response = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies2);

    expect(response.statusCode).toBe(401);
  });

  it("should update a meal", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const response = await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .send({
        name: "Frango",
        description: "Frango com batata e arroz",
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
        userId,
      });

    const responseMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies);

    expect(response.statusCode).toBe(200);
    expect(responseMeal.body.meal.description).toBe("Frango com batata e arroz");
  });

  it("should not update a meal from another", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const { cookies: cookies2 } = await createUserAndGetCookieAndUserId({
      name: "Patricia",
      username: "pati",
    });

    const response = await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", cookies2)
      .send({
        name: "Frango",
        description: "Frango com batata e arroz",
        date: "2024.06.30",
        time: "12:00",
        onDiet: true,
        userId,
      });

    expect(response.statusCode).toBe(401);
  });

  it("should delete a meal", async () => {
    const { cookies, userId } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
      userId,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const response = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies);

    expect(response.statusCode).toBe(200);
  });

  it("should not delete a meal from another user", async () => {
    const { cookies } = await createUserAndGetCookieAndUserId({
      name: "Pedro",
      username: "pedrin",
    });

    await request(app.server).post("/meals").set("Cookie", cookies).send({
      name: "Frango",
      description: "Frango com batata",
      date: "2024.06.30",
      time: "12:00",
      onDiet: true,
    });

    const responseMeals = await request(app.server).get("/meals").set("Cookie", cookies);

    const mealId = responseMeals.body.meals[0].id;

    const { cookies: cookies2 } = await createUserAndGetCookieAndUserId({
      name: "Maria",
      username: "maria",
    });

    const response = await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies2);

    expect(response.statusCode).toBe(401);
  });
});
