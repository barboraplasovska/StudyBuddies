import { GroupModel } from "database/model/GroupModel";
import {UserWithGroupRoleEntity} from "./UserEntity";

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupEntityResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/GroupModelResponse'
 *         - type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserWithGroupRoleEntityResponse'
 */
interface GroupEntity extends GroupModel {
    users : UserWithGroupRoleEntity[]
}

export { GroupEntity };
