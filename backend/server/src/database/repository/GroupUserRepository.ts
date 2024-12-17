import { BaseRepository } from "./BaseRepository";
import { GroupUserDbModel, GroupUserModel } from "database/model/GroupUserModel";

class GroupUserRepository extends BaseRepository<GroupUserModel> {

    constructor() {
        super(GroupUserDbModel);
    }

    getByGroupId(groupId: string) {
        return this.dbModel.findAll({ where: { groupid: groupId }});
    }

    getByUserId(userId: string) {
        return this.dbModel.findAll({ where: { userid: userId }});
    }

    getGroupOwner(groupId: string) {
        return this.dbModel.findOne({ where: { groupid: groupId, grouproleid: 1 }});
    }

    getByGroupAndUser(groupId: string, userId: string) {
        return this.dbModel.findOne({ where: { groupid: groupId, userid: userId }});
    }
}

const groupUserRepository = new GroupUserRepository();

export { GroupUserRepository, groupUserRepository };
