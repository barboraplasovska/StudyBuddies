import { BaseRepository } from "./BaseRepository";
import { GroupDbModel, GroupModel } from "database/model/GroupModel";

class GroupRepository extends BaseRepository<GroupModel> {
    constructor() {
        super(GroupDbModel);
    }

    getByName(name: string) {
        return this.dbModel.findOne({ where: { name: name } });
    }

    getByFilter(filter: object): Promise<GroupModel[]> {
        return this.dbModel.findAll({ where: filter, raw: true });
    }
}

const groupRepository = new GroupRepository();

export { GroupRepository, groupRepository };
