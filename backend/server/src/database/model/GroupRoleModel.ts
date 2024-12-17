import { sequelize } from "database/Database";
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupRoleModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The role ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The role's name.
 *           example: "Member"
 *     GroupRoleModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The role's name.
 *           example: "Member"
 */

interface GroupRoleModel
  extends Model<
    InferAttributes<GroupRoleModel>,
    InferCreationAttributes<GroupRoleModel>
  > {
  id: CreationOptional<string>;
  name: string;
}

const GroupRoleDbModel = sequelize.define<GroupRoleModel>("grouprole", {
  id: {
    primaryKey: true,
    type: DataTypes.BIGINT,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export { GroupRoleModel, GroupRoleDbModel };
