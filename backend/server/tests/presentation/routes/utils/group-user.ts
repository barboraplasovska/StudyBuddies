import { GroupUserModel } from "database/model/GroupUserModel";
import {GroupRoleEnum} from "utils/enumerations/GroupRoleEnum";

const validGroupUser: GroupUserModel = {
    id: "1",
    userid: "800",
    groupid: "1",
    grouproleid: "0"
} as GroupUserModel;

const GroupUserMember : GroupUserModel = {
    id: "1",
    userid: "800",
    groupid: "1",
    grouproleid: GroupRoleEnum.MEMBER
} as GroupUserModel;

const GroupUserAdmin : GroupUserModel = {
    id: "1",
    userid: "800",
    groupid: "1",
    grouproleid: GroupRoleEnum.ADMINISTRATOR
} as GroupUserModel;

const GroupUserOwner : GroupUserModel = {
    id: "1",
    userid: "800",
    groupid: "1",
    grouproleid: GroupRoleEnum.OWNER
} as GroupUserModel;

export {
    validGroupUser,
    GroupUserMember,
    GroupUserAdmin,
    GroupUserOwner
}