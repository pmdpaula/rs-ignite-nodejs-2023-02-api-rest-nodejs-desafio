import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const mealsRoutes = async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const { userId } = request.cookies;

      try {
        const meals = await knex("meals").where({ user_id: userId });

        return reply.status(200).send({ meals });
      } catch (error) {
        console.error(error);
        return reply.status(500).send();
      }
    },
  );

  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        time: z.string(),
        onDiet: z.boolean(),
      });

      const { userId } = request.cookies;

      const { name, description, date, time, onDiet } = createMealBodySchema.parse(
        request.body,
      );

      try {
        await knex("meals").insert({
          id: randomUUID(),
          name,
          description,
          date,
          time,
          on_diet: onDiet,
          user_id: userId,
        });

        return reply.status(201).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send();
      }
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      try {
        const meal = await knex("meals").where({ id }).first();

        if (!meal) {
          return reply.status(404).send();
        }

        const { userId } = request.cookies;

        if (userId !== meal.user_id) {
          return reply.status(401).send();
        }

        return { meal };
      } catch (error) {
        console.error(error);
        return reply.status(500).send();
      }
    },
  );

  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        onDiet: z.boolean().optional(),
      });

      const { name, description, date, time, onDiet } = updateMealBodySchema.parse(
        request.body,
      );

      const updateMealParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = updateMealParamsSchema.parse(request.params);

      try {
        const mealToEdit = await knex("meals").where({ id }).first();

        if (!mealToEdit) {
          return reply.status(404).send();
        }

        const { userId } = request.cookies;

        if (userId !== mealToEdit.user_id) {
          return reply.status(401).send();
        }

        await knex("meals").where({ id }).update({
          name,
          description,
          date,
          time,
          on_diet: onDiet,
        });

        return reply.status(200).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send();
      }
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string(),
      });

      const { id } = deleteMealParamsSchema.parse(request.params);

      try {
        const mealToDelete = await knex("meals").where({ id }).first();

        if (!mealToDelete) {
          return reply.status(404).send();
        }

        const { userId } = request.cookies;

        if (userId !== mealToDelete.user_id) {
          return reply.status(401).send();
        }

        await knex("meals").where({ id }).del();

        return reply.status(200).send();
      } catch (error) {
        console.error(error);
        return reply.status(500).send();
      }
    },
  );
};
