import { AppRoleModel } from "./AppRoleModel";
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
 *     UserModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The user's name.
 *           example: "John Doe"
 *         description:
 *           type: string
 *           description: The user's description
 *           example: "This is the end."
 *         roleId:
 *           type: string
 *           description: The user's role Id
 *           example: 1
 *         joinDate:
 *           type: string
 *           format: date-time
 *           description: The creation date of the user
 *           example: "2024-02-23T12:38:56"
 *         banDate:
 *           type: string
 *           format: date-time
 *           description: The ban date of the user
 *           example: "2025-07-23T15:19:36"
 *         picture:
*            type: string
*            description: The user's profile picture
*            example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s"
 *         verified:
 *           type: string
 *           format: boolean
 *           description: Whether the user is verified or not
 *           example: true
 *     UserModelRequest:
 *       type: object
 *       properties:
 *         userInfo:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The user's name.
 *               example: "John Doe"
 *             description:
 *               type: string
 *               description: The user's description
 *               example: "This is the end."
 *             roleId:
 *               type: string
 *               description: The user's role Id
 *               example: 1
 *             banDate:
 *               type: string
 *               format: date-time
 *               description: The ban date of the user
 *               example: "2025-07-23T15:19:36"
 *               required: false
 *             picture:
 *               type: string
 *               description: The user's profile picture
 *               example: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYPiMtWldo_i_mS4CE5PNZ7lFeSUIKEbpCuQ&s"
 *         credentialInfo:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: The email of the user
 *               example: "john.doe@gmail.com"
 *             password:
 *               type: string
 *               description: The hashed and salted password of the user
 *               example: "c0a0770637de1601a08404aff3e88dfb4b58c35b"
 */

interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  id: CreationOptional<string>;
  name: string | undefined;
  description: string | undefined;
  roleId: ForeignKey<AppRoleModel['id']> | undefined;
  joinDate: string | undefined;
  banDate: string | undefined;
  picture: string | undefined;
  verified: boolean | undefined;
}

const UserDbModel = sequelize.define<UserModel>("user", {
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
  roleId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  banDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "",
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

export { UserModel, UserDbModel };
