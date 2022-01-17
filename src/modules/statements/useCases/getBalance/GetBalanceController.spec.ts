import request from 'supertest';
import { app } from '../../../../app';
import {createConnection, Connection } from 'typeorm';
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let connection: Connection;
let token: string;

describe("Get Balance", () => {
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

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 700,
        description: "Description test",
      } as ICreateStatementDTO)
      .set({
        Authorization: `Bearer ${token}`
      })

      await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 200,
        description: "Description test 2",
      } as ICreateStatementDTO)
      .set({
        Authorization: `Bearer ${token}`
      })
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance to an authenticated user", async () => {
    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.body).toHaveProperty("balance")
  });
})
