class CredentialEntity {

    validationCode: string;
    email: string;
    password: string;
    userId: string;

    constructor(validationCode: string, email: string, password: string, userId: string) {
        this.validationCode = validationCode;
        this.email = email;
        this.password = password;
        this.userId = userId;
    }
}

export {
    CredentialEntity
};