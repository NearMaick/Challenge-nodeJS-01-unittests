import request from 'supertest';
import { createConnection, Connection } from "typeorm";
import { app } from '../../../../app';
import { ICreateStatementDTO } from './ICreateStatementDTO';

let connection: Connection;
let token: string;

describe("Create deposit", () => {
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

    token = response.body.token;
  });

  afterAll(async ()=> {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should not be able to make a withdraw with statement invalid balance to an authenticate user",async () => {
    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 200,
      description: "Description test",
    } as ICreateStatementDTO)
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(400)
  })

  it("should be able to make a deposit to an authenticate user",async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Description test",
      } as ICreateStatementDTO)
      .set({
        Authorization: `Bearer ${token}`
      })
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
  });

  it("should be able to make a withdraw with statement valid balance to an authenticate user",async () => {
    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      amount: 200,
      description: "Description test",
    } as ICreateStatementDTO)
    .set({
      Authorization: `Bearer ${token}`
    })
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should be able to get a statement",async () => {
    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 200,
        description: "Description test",
      } as ICreateStatementDTO)
      .set({
        Authorization: `Bearer ${token}`
      })

      const { id } = statementResponse.body

      const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`
      })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("id")
  });
})
