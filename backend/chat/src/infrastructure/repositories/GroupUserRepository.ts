import {GroupUserDbModel, GroupUserModel} from "../models/GroupUserModel";

class GroupUserRepository {
    groupUserModel;

    constructor() {
        this.groupUserModel = GroupUserDbModel;
    }

    getGroupUsersByUserId(userId: string): Promise<GroupUserModel[]> {
        return this.groupUserModel.findAll({ where: { userid: userId } });
    }

    getAll() {
        return this.groupUserModel.findAll();
    }
}

export default GroupUserRepository;