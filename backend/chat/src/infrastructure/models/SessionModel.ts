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
 *     SessionModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The session ID.
 *           example: "dc80e82a-0721-40c3-9c3c-60a7868e89d1"
 *         userid:
 *           type: string
 *           description: The user ID of the related user.
 *           example: "1"
 *         expireat:
 *           type: string
 *           format: date-time
 *           description: The expiry date of the session
 *           example: "2025-07-23T15:19:36"
 */
interface SessionModel extends Model<
    InferAttributes<SessionModel>,
    InferCreationAttributes<SessionModel>
    > {
    id: CreationOptional<string>;
    userid: ForeignKey<UserModel['id']> | undefined;
    expireat: string | undefined;
}

const SessionDbModel = sequelize.define<SessionModel>("session", {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
    },
    userid: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    expireat: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

export { SessionModel, SessionDbModel };
