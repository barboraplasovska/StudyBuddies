import { AuthResponse } from "domain/entity/AuthEntity";
import { Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

class JWT {
    genJWT = (userId: string, appRoleId: string): string => {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as Secret;

        return jwt.sign({ userId: userId, appRoleId: appRoleId }, jwtSecretKey);
    };

    decodeJWT = (token: string): string | jwt.JwtPayload => {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as Secret;

        return jwt.verify(token, jwtSecretKey);
    };

    storeJwtInCookie = (res: Response, information: AuthResponse, jwt: string | null = null) => {
        if (information.user.roleId && information.session.expireat) {
            const expireAt = new Date(information.session.expireat).getTime().toString();
            res.setHeader("Set-Cookie", [
                `jwt=${jwt ?? this.genJWT(information.user.id, information.user.roleId)}`,
                `sessionId=${information.session.id}`,
                `expireAt=${expireAt}`,
            ]);
        }
        else
            throw new Error("The roleId has not been specified");
    };
}

export {
    JWT
};