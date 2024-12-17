import { BaseRepository } from "./BaseRepository";
import { AppRoleDbModel, AppRoleModel } from "database/model/AppRoleModel";

class AppRoleRepository extends BaseRepository<AppRoleModel> {
  constructor() {
    super(AppRoleDbModel);
  }
}

const appRoleRepository = new AppRoleRepository();

export { AppRoleRepository, appRoleRepository };
