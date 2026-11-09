import type { FindUserByEmailUseCase } from "../../application/use-cases/find-user-by-email.use-case.ts";
import type { RegisterUserInput } from "../schemas/register-user.schema.ts";

export class FindUserByEmailController {
  private readonly findUserByEmailUseCase: FindUserByEmailUseCase;

  constructor(findUserByEmailUseCase: FindUserByEmailUseCase) {
    this.findUserByEmailUseCase = findUserByEmailUseCase;
  }

  async handle(input: string) {
    return this.findUserByEmailUseCase.execute(input);
  }
}
