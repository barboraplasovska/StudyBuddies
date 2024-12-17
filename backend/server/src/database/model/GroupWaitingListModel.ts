import { GroupModel } from "./GroupModel";
import { UserModel } from "./UserModel";
import { sequelize } from "database/Database";
import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupWaitingListResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The waiting list ID.
 *           example: "0"
 *         userid:
 *           type: string
 *           description: The user Id
 *           example: 1
 *         groupid:
 *           type: string
 *           description: The group Id
 *           example: 1
 *     GroupWaitingListRequest:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           description: The user Id
 *           example: 1
 *         groupid:
 *           type: string
 *           description: The group Id
 *           example: 1
 */

interface GroupWaitingListModel
    extends Model<
        InferAttributes<GroupWaitingListModel>,
        InferCreationAttributes<GroupWaitingListModel>
    > {
    id: CreationOptional<string>;
    userid: ForeignKey<UserModel['id']> | undefined,
    groupid: ForeignKey<GroupModel['id']> | undefined,
}

const GroupWaitingListDbModel = sequelize.define<GroupWaitingListModel>("groupwaitinglist", {
    id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
    },
    userid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    groupid: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
});

export { GroupWaitingListModel, GroupWaitingListDbModel };