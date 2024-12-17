/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message.
 *       example:
 *         error: "Error message"
 *     ForbiddenResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message.
 *       example:
 *         error: "Forbidden !"
 *     UnauthorizedResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message.
 *       example:
 *         error: "Unauthorized !"
 */

type ErrorResponse = {
  error: string;
};

export { ErrorResponse };
