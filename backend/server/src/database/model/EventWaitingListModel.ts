import { EventModel } from "./EventModel";
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
 *     EventWaitingListResponse:
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
 *         eventid:
 *           type: string
 *           description: The event Id
 *           example: 1
 *     EventWaitingListRequest:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *           description: The user Id
 *           example: 1
 *         eventid:
 *           type: string
 *           description: The event Id
 *           example: 1
 */

interface EventWaitingListModel
    extends Model<
        InferAttributes<EventWaitingListModel>,
        InferCreationAttributes<EventWaitingListModel>
    > {
    id: CreationOptional<string>;
    userid: ForeignKey<UserModel['id']> | undefined,
    eventid: ForeignKey<EventModel['id']> | undefined,
}

const EventWaitingListDbModel = sequelize.define<EventWaitingListModel>("eventwaitinglist", {
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
    eventid: {
        type: DataTypes.BIGINT,
        allowNull: false
    }
});

export { EventWaitingListModel, EventWaitingListDbModel };