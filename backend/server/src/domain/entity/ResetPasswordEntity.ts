class ResetPasswordEntity {

    validationCode: string;
    verified: boolean;
    email: string;

    constructor(validationCode: string, email: string) {
        this.validationCode = validationCode;
        this.email = email;
        this.verified = false;
    }
}

export {
    ResetPasswordEntity
};