import {BaseRepository} from "./BaseRepository";
import { GroupWaitingListDbModel, GroupWaitingListModel } from "database/model/GroupWaitingListModel";

class GroupWaitingListRepository extends BaseRepository<GroupWaitingListModel> {
    constructor() {
        super(GroupWaitingListDbModel);
    }

    async deleteByUserAndGroup(userId: string, groupId: string)
    {
        const result : GroupWaitingListModel = await this.getByGroupAndUser(groupId, userId);
        return this.delete(result.id);
    }

    getByGroupId(groupId: string) {
        return this.dbModel.findAll({ where: { groupid: groupId } });
    }

    getByUserId(userId: string) {
        return this.dbModel.findAll({ where: { userid: userId } });
    }

    getByGroupAndUser(groupId: string, userId: string) {
        return this.dbModel.findOne({ where: { groupid: groupId, userid: userId }});
    }
}

const groupWaitingListRepository = new GroupWaitingListRepository();

export { GroupWaitingListRepository, groupWaitingListRepository };