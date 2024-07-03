import { app } from "../../app";
import request from "supertest";

interface CreateUserAndGetCookieAndUserIdRequestProps {
  name: string;
  username: string;
}

interface CreateUserAndGetCookieAndUserIdResponseProps {
  cookies: string[];
  userId: string;
}

export const createUserAndGetCookieAndUserId = async ({
  name,
  username,
}: CreateUserAndGetCookieAndUserIdRequestProps): Promise<CreateUserAndGetCookieAndUserIdResponseProps> => {
  await request(app.server).post("/users").send({
    name,
    username,
  });

  const responseSession = await request(app.server).put("/users/session").send({
    username,
  });

  const cookies = responseSession.get("Set-Cookie")!;

  const userResponse = await request(app.server)
    .get(`/users/?username=${username}`)
    .set("Cookie", cookies);

  return {
    cookies,
    userId: userResponse.body.user.id,
  };
};
