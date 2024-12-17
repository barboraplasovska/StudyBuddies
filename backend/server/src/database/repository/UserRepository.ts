import { BaseRepository } from "./BaseRepository";
import { UserDbModel, UserModel } from "database/model/UserModel";

class UserRepository extends BaseRepository<UserModel> {
  constructor() {
    super(UserDbModel);
  }
}

const userRepository = new UserRepository();

export { UserRepository, userRepository };