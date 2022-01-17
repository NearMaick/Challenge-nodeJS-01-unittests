import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepositoriesInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeAll(() => {
    usersRepositoriesInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoriesInMemory);
  })

  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "john@doe.test",
      password: "1234"
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    const nameCreated = await usersRepositoriesInMemory.findByEmail(user.email);

    expect(nameCreated).toHaveProperty("id");
  });

});
