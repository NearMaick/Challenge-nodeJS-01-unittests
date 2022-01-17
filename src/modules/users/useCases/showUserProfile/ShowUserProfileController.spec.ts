import request from 'supertest';
import { app } from '../../../../app';
import {createConnection, Connection } from 'typeorm';

let connection: Connection;
let token: string;

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "john@doe.test",
      password: "1234"
    })

    const response = await request(app).post("/api/v1/sessions").send({
      name: "John Doe",
      email: "john@doe.test",
      password: "1234"
    })

     token = response.body.token
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show an authenticated user", async () => {
   const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("name")
    expect(response.body).toHaveProperty("email")
  });
});
