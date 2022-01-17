import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let usersRepositoriesInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeAll(() => {
    usersRepositoriesInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoriesInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoriesInMemory);
  })

  it("should be able to return an authenticated user", async () => {
    const user: ICreateUserDTO = {
      name: "John Doe",
      email: "john@doe.test",
      password: "1234"
    };

    await createUserUseCase.execute(user);


    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("user");
  });
});
