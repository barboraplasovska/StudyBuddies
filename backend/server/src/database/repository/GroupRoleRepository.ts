import { BaseRepository } from "./BaseRepository";
import { GroupRoleDbModel, GroupRoleModel } from "database/model/GroupRoleModel";

class GroupRoleRepository extends BaseRepository<GroupRoleModel> {

    constructor() {
        super(GroupRoleDbModel);
    }
}

const groupRoleRepository = new GroupRoleRepository();

export { GroupRoleRepository, groupRoleRepository };