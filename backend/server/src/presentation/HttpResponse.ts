import { ErrorResponse } from "utils/ErrorResponse";

/**
 * @swagger
 * components:
 *   schemas:
 *     HttpResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           description: The HTTP status code.
 *           example: 400
 *         body:
 *           type: object
 *           description: The error body.
 *           schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *           example: {error: "Bad Request"}
 */

class HttpResponse<T> {
  statusCode: number;
  body: T | T[] | ErrorResponse;

  constructor(body: T | T[] | ErrorResponse, statusCode: number = 200) {
    this.body = body;
    this.statusCode = statusCode;
  }
}

export { HttpResponse };

