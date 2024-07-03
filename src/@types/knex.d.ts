// eslint-disable-next-line
import { Knex } from "knex";
// ou faça apenas:
// import 'knex'

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      username: string;
    };
    meals: {
      id: string;
      name: string;
      description: string;
      date: string;
      time: string;
      on_diet: boolean;
      user_id: string;
    };
  }
}
