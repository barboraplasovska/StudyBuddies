import { GroupModel } from "./GroupModel";
import { GroupRoleModel } from "./GroupRoleModel";
import { UserModel } from "./UserModel";
import { sequelize } from "infrastructure/mariadb";
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
 *     GroupUserModelResponse:
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
 *         groupid:
 *           type: string
 *           description: The group Id
 *           example: 1
 *         grouproleid:
 *           type: string
 *           description: The group role Id
 *           example: 1
 *     GroupUserModelRequest:
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
 *         grouproleid:
 *           type: string
 *           description: The group role Id
 *           example: 1
 */

interface GroupUserModel
  extends Model<
    InferAttributes<GroupUserModel>,
    InferCreationAttributes<GroupUserModel>
  > {
  id: CreationOptional<string>;
  userid: ForeignKey<UserModel['id']> | undefined;
  groupid: ForeignKey<GroupModel['id']> | undefined;
  grouproleid: ForeignKey<GroupRoleModel['id']> | undefined
}

const GroupUserDbModel = sequelize.define<GroupUserModel>("groupuser", {
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
  groupid: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  grouproleid: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
});

export { GroupUserModel, GroupUserDbModel };