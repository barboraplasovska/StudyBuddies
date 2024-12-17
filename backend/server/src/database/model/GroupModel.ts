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
 *     GroupModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The group's name.
 *           example: "EPITA MTI 2025"
 *         description:
 *           type: string
 *           description: The group's description
 *           example: "Group for MTI student of the current promotion."
 *         address:
 *           type: string
 *           description: The group's address
 *           example: "83 Boulevard Marius Vivier Merle, 69003 Lyon"
 *         picture:
 *           type: string
 *           description: The group's profile picture link
 *           example: "https://www.weodeo.com/wp-content/uploads/2024/03/devops.webp"
 *         verified:
 *           type: boolean
 *           description: Whether the group is a verified one or not
 *           example: 1
 *         parentId:
 *           type: string
 *           description: The group's parent Id
 *           example: 1
 *     GroupModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The group's name.
 *           example: "EPITA MTI 2025"
 *         description:
 *           type: string
 *           description: The group's description
 *           example: "Group for MTI student of the current promotion."
 *         address:
 *           type: string
 *           description: The group's address
 *           example: "83 Boulevard Marius Vivier Merle, 69003 Lyon"
 *         picture:
 *           type: string
 *           description: The group's profile picture link
 *           example: "https://www.weodeo.com/wp-content/uploads/2024/03/devops.webp"
 *         parentId:
 *           type: string
 *           description: The group's parent Id
 *           example: 1
 */

interface GroupModel
  extends Model<
    InferAttributes<GroupModel>,
    InferCreationAttributes<GroupModel>
  > {
  id: CreationOptional<string>;
  name: string | undefined;
  description: string | undefined;
  address: string | undefined;
  picture: string | undefined;
  verified: boolean;
  parentId: ForeignKey<GroupModel['id']> | undefined;
}

const GroupDbModel = sequelize.define<GroupModel>("groups", {
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
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  parentId: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
});

export { GroupModel, GroupDbModel };