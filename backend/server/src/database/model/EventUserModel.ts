import { EventModel } from "./EventModel";
import { GroupRoleModel } from "./GroupRoleModel";
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
 *     EventUserModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *           example: "0"
 *         userid:
 *           type: string
 *           description: The user Id
 *           example: 1
 *         eventid:
 *           type: string
 *           description: The group Id
 *           example: 1
 *         grouproleid:
 *           type: string
 *           description: The group role Id
 *           example: 1
 *     EventUserModelRequest:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           description: The user Id
 *           example: 1
 *         eventid:
 *           type: string
 *           description: The group Id
 *           example: 1
 *         grouproleid:
 *           type: string
 *           description: The group role Id
 *           example: 1
 */

interface EventUserModel
    extends Model<
        InferAttributes<EventUserModel>,
        InferCreationAttributes<EventUserModel>
    > {
    id: CreationOptional<string>;
    userid: ForeignKey<UserModel['id']> | undefined;
    eventid: ForeignKey<EventModel['id']> | undefined;
    grouproleid: ForeignKey<GroupRoleModel['id']> | undefined
}

const EventUserDbModel = sequelize.define<EventUserModel>("eventuser", {
    id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
    },
    userid: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    eventid: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    grouproleid: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
});

export { EventUserModel, EventUserDbModel };