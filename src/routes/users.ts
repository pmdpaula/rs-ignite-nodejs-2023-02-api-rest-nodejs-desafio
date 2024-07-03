import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const usersRoutes = async (app: FastifyInstance) => {
  app.put("/session", async (request, reply) => {
    const getUserSessionParamsSchema = z.object({
      username: z.string(),
    });

    let { sessionId, userId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    if (!userId) {
      const { username } = getUserSessionParamsSchema.parse(request.body);

      const user = await knex("users").where({ username }).first();

      if (!user) {
        return reply.status(404).send("Usuário não encontrado.");
      }

      userId = user?.id;

      reply.setCookie("userId", userId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return reply.status(200).send();
  });

  app.post("/", async (request, reply) => {
    const createUserBodySquema = z.object({
      name: z.string(),
      username: z.string(),
    });

    const { name, username } = createUserBodySquema.parse(request.body);

    try {
      await knex("users").insert({
        id: randomUUID(),
        name,
        username,
      });

      return reply.status(201).send();
    } catch (error) {
      console.error(error);
      return reply.status(500).send();
    }
  });

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getUserQuerySchema = z.object({
        username: z.string(),
      });

      const { username } = getUserQuerySchema.parse(request.query);

      const user = await knex("users").where({ username }).first();

      if (!user) {
        return reply.status(404).send();
      }

      return { user };
    },
  );

  app.get(
    "/report",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { userId } = request.cookies;

      const meals = await knex("meals").where({ user_id: userId });

      const mealsOnDiet = meals.filter((meal) => meal.on_diet);

      const { bestSequencyQty } = meals.reduce(
        (acc, meal) => {
          if (meal.on_diet) {
            acc.bestCurrentSequencyQty += 1;

            if (acc.bestCurrentSequencyQty > acc.bestSequencyQty) {
              acc.bestSequencyQty = acc.bestCurrentSequencyQty;
            }
          } else {
            acc.bestCurrentSequencyQty = 0;
          }

          return acc;
        },
        { bestSequencyQty: 0, bestCurrentSequencyQty: 0 },
      );

      return reply.status(200).send({
        totalMeals: meals.length,
        totalMealsOnDiet: mealsOnDiet.length,
        totalMealsOutDiet: meals.length - mealsOnDiet.length,
        bestSequencyQty,
      });
    },
  );
};
