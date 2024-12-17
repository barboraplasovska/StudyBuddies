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
 *     CredentialModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The credentials ID.
 *           example: "0"
 *         userid:
 *           type: string
 *           description: The user ID of the related user.
 *           example: "1"
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: "john.doe@gmail.com"
 *         password:
 *           type: string
 *           description: The hashed and salted password of the user
 *           example: "c0a0770637de1601a08404aff3e88dfb4b58c35b"
 *         salt:
 *           type: string
 *           description: Salt used to salt the password
 *           example: "34j5XljL7u"
 *     CredentialModelRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: "john.doe@gmail.com"
 *         password:
 *           type: string
 *           description: The password of the user to connect
 *           example: "mypwd"
 */
interface CredentialModel extends Model<
    InferAttributes<CredentialModel>,
    InferCreationAttributes<CredentialModel>
    > {
    id: CreationOptional<string>;
    userid: ForeignKey<UserModel['id']> | undefined;
    email: string | undefined;
    password: string | undefined;
    salt: string | undefined;
}

const CredentialDbModel = sequelize.define<CredentialModel>("credential", {
    id: {
        primaryKey: true,
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
    },
    userid: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export { CredentialModel, CredentialDbModel };

