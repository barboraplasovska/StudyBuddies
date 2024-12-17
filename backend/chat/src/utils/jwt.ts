import jwt, { Secret } from "jsonwebtoken";

class JWT {
    decodeJWT = (token: string): string | jwt.JwtPayload => {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as Secret;

        return jwt.verify(token, jwtSecretKey);
    };
}

export {
    JWT
};