import { UserDbModel } from "infrastructure/models/UserModel";

class UserRepository {
  userModel;

  constructor() {
    this.userModel = UserDbModel;
  }

  async getById(id: string) {
    return this.userModel.findByPk(id);
  }
}

const userRepository = new UserRepository();

export { UserRepository, userRepository };