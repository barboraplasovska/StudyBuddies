import { sequelize } from "infrastructure/mariadb";
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
 *     AppRoleModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The role ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The role's name.
 *           example: "Moderator"
 *     AppRoleModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The role's name.
 *           example: "Moderator"
 */

interface AppRoleModel
  extends Model<
    InferAttributes<AppRoleModel>,
    InferCreationAttributes<AppRoleModel>
  > {
  id: CreationOptional<string>;
  name: string;
}

const AppRoleDbModel = sequelize.define<AppRoleModel>("approle", {
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

export { AppRoleModel, AppRoleDbModel };
