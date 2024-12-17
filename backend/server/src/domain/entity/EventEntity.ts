import { EventModel } from "database/model/EventModel";
import { GroupModel } from "database/model/GroupModel";
import { UserWithGroupRoleEntity } from "./UserEntity";

/**
 * @swagger
 * components:
 *   schemas:
 *     EventEntityResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/EventModelResponse'
 *         - type: object
 *           properties:
 *             group:
 *               $ref: '#/components/schemas/GroupModelResponse'
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithGroupRoleEntityResponse'
 */
interface EventEntity extends EventModel {
    group?: GroupModel,
    users: UserWithGroupRoleEntity[]
}

export { EventEntity };