import { AppRoleModel } from "database/model/AppRoleModel";
import { BaseService } from "./BaseService";
import { AppRoleRepository, appRoleRepository } from "database/repository/AppRoleRepository";

class AppRoleService extends BaseService<AppRoleModel, AppRoleRepository> {

    constructor(appRoleRepository : AppRoleRepository) {
        super(appRoleRepository);
    }
}

const appRoleService = new AppRoleService(appRoleRepository);

export {
    AppRoleService,
    appRoleService
};