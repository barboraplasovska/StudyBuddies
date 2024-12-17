import { BaseService } from "./BaseService";
import { GroupRoleModel } from "database/model/GroupRoleModel";
import {GroupRoleRepository, groupRoleRepository} from "database/repository/GroupRoleRepository";

class GroupRoleService extends BaseService<GroupRoleModel, GroupRoleRepository> {

    constructor(groupRoleRepository: GroupRoleRepository) {
        super(groupRoleRepository);
    }
}

const groupRoleService = new GroupRoleService(groupRoleRepository);

export { GroupRoleService, groupRoleService };