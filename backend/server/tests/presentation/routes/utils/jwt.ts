import jwt, {Secret} from "jsonwebtoken";

// JWT with userID = 36 && appRoleId = 1 (ADMIN)
const validJwtWithAdministratorPermission = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM2LCJhcHBSb2xlSWQiOjEsImlhdCI6MTcxNTE4NzU1M30.zv5JyYaeQvl3RZgreBDSMrOeuIUifZlI_hXkCjTuUKI"

// JWT with userID = 36 && appRoleId = 2 (USER)
const validJwtWithUserPermission = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM2LCJhcHBSb2xlSWQiOjIsImlhdCI6MTcxNTE4NzU1M30.eJJLrcrxtWVi3DI3e6pfVnm7KfDWfM9fScdDqXIziEg"

const wellFormedJwtWithoutValidElements = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const decodeJWT = (token: string): Object => {
    const jwtSecretKey = "EPStudy2k24BuddiesITA" as Secret;
    return jwt.verify(token, jwtSecretKey);
}

export {
    validJwtWithAdministratorPermission,
    validJwtWithUserPermission,
    wellFormedJwtWithoutValidElements,
    decodeJWT
}