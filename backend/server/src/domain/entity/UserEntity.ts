import { GroupModel } from "database/model/GroupModel";
import { UserModel } from "database/model/UserModel";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserEntityResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserModelResponse'
 *         - type: object
 *           properties:
 *             groups:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GroupModelResponse'
 */
interface UserEntity extends UserModel {
    groups: GroupModel[]
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithGroupRoleEntityResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UserModelResponse'
 *         - type: object
 *           properties:
 *             groupRoleId:
 *               type: string
 *               description: The group role ID.
 *               example: "2"
 */
interface UserWithGroupRoleEntity extends UserModel {
    grouproleid: string
}

export { UserEntity, UserWithGroupRoleEntity };
