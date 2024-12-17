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
 *     ExamModelResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user ID.
 *           example: "0"
 *         name:
 *           type: string
 *           description: The exam's name.
 *           example: "DevOps exam"
 *         description:
 *           type: string
 *           description: The exam's description
 *           example: "Grafana and Prometheus"
 *         userId:
 *           type: string
 *           description: The user's Id
 *           example: 1
 *         date:
 *           type: string
 *           format: date-time
 *           description: The creation date of the exam
 *           example: "2024-02-23T12:38:56"
 *         endtime:
 *           type: string
 *           format: date-time
 *           description: The endtime of the exam
 *           example: "2024-02-23T13:38:56"
 *     ExamModelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The exam's name.
 *           example: "DevOps exam"
 *         description:
 *           type: string
 *           description: The exam's description
 *           example: "Grafana and Prometheus"
 *         userId:
 *           type: string
 *           description: The user's Id
 *           example: 1
 *         date:
 *           type: string
 *           format: date-time
 *           description: The creation date of the exam
 *           example: "2024-02-23T12:38:56"
 *         endtime:
 *           type: string
 *           format: date-time
 *           description: The endtime of the exam
 *           example: "2024-02-23T13:38:56"
 */

interface ExamModel
    extends Model<
        InferAttributes<ExamModel>,
        InferCreationAttributes<ExamModel>
    > {
    id: CreationOptional<string>;
    name: string | undefined;
    description: string | undefined;
    userId: ForeignKey<UserModel['id']> | undefined;
    date: string | undefined;
    endtime: string | undefined;
}

const ExamDbModel = sequelize.define<ExamModel>("exam", {
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
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endtime: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

export { ExamModel, ExamDbModel };
