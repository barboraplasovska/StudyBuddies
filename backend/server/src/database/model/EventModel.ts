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
 *     EventModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The event's ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The event's name.
 *           example: "EPITA MTI 2025"
 *         description:
 *           type: string
 *           description: The event's description
 *           example: "Event for MTI student of the current promotion."
 *         groupId:
 *           type: string
 *           description: The id of the group with this event.
 *           example: 1
 *         date:
 *           type: string
 *           description: Date of the event.
 *           example: "2025-07-23T15:19:36"
 *         endtime:
 *           type: string
 *           description: End time of the event.
 *           example: "2025-07-23T15:19:36"
 *         location:
 *           type: string
 *           description: The location of the event.
 *           enum:
 *             - online
 *             - offline
 *             - hybrid
 *           example: online
 *         link:
 *           type: string
 *           description: The link to the event if it is online.
 *           example: https://example.link-call.com/3vXfq67r
 *         address:
 *           type: string
 *           description: The address of the event if it is offline.
 *           example: "14 rue voltaire, Kremlin-Bicêtre"
 *         maxPeople:
 *           type: integer
 *           description: Maximum number of people that can attend the event.
 *           example: 14
 *     EventModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The event's name.
 *           example: "Révision"
 *         description:
 *           type: string
 *           description: The Event's description
 *           example: "Event for MTI student of the current promotion."
 *         groupId:
 *           type: string
 *           description: The Event's parent Id
 *           example: 1
 *         date:
 *           type: string
 *           description: Date of the event.
 *           example: "2025-07-23T15:19:36"
 *         endtime:
 *           type: string
 *           description: End time of the event.
 *           example: "2025-07-23T15:19:36"
 *         location:
 *           type: string
 *           description: The location of the event.
 *           enum:
 *             - online
 *             - offline
 *             - hybrid
 *           example: online
 *         link:
 *           type: string
 *           description: The link to the event if it is online.
 *           example: https://example.link-call.com/3vXfq67r
 *         address:
 *           type: string
 *           description: The address of the event if it is offline.
 *           example: "14 rue voltaire, Kremlin-Bicêtre"
 *         maxPeople:
 *           type: integer
 *           description: Maximum number of people that can attend the event.
 *           example: 14
 *     EventModelLocationRequest:
 *       type: object
 *       properties:
 *         location:
 *           type: string
 *           description: The location of the event.
 *           required: true
 *           enum:
 *             - online
 *             - offline
 *             - hybrid
 *           example: hybrid
 *         link:
 *           type: string
 *           description: The link to the event if it is online.
 *           example: https://example.link-call.com/3vXfq67r
 *         address:
 *           type: string
 *           description: The address of the event if it is offline.
 *           example: "14 rue voltaire, Kremlin-Bicêtre"
 */

enum EventLocation {
    ONLINE = 'online',
    OFFLINE = 'offline',
    HYBRID = 'hybrid'
}

interface EventModel
  extends Model<
    InferAttributes<EventModel>,
    InferCreationAttributes<EventModel>
  > {
  id: CreationOptional<string>;
  name: string | undefined;
  description: string | undefined;
  groupId: ForeignKey<EventModel['id']> | undefined;
  date: string | undefined;
  endtime: string | undefined;
  location: EventLocation | undefined;
  link: string | undefined;
  address: string | undefined;
  maxPeople: number | undefined;
}

const EventDbModel = sequelize.define<EventModel>("event", {
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
  groupId: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endtime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.ENUM,
    values: Object.values(EventLocation),
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maxPeople: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

export { EventModel, EventDbModel, EventLocation };