import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";

export class ICreateTransferDTO {
  sender_id: string;
  receiver_id: string;
  amount: number;
  description: string;
}

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description,
  }: ICreateTransferDTO) {
    const receiverUser = await this.usersRepository.findById(receiver_id);

    if (!receiverUser) {
      throw new AppError("User not found");
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: true,
    });

    if (balance < amount) {
      throw new AppError("Insufficient funds");
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      amount,
      description,
      type: OperationType.WITHDRAW,
    });

    const operationTransfer = await this.statementsRepository.create({
      user_id: receiver_id,
      amount,
      description,
      type: OperationType.TRANSFER,
    });

    return operationTransfer;
  }
}
