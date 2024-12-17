import { BaseRepository } from "./BaseRepository";
import { CredentialDbModel, CredentialModel } from "database/model/CredentialModel";

class CredentialRepository extends BaseRepository<CredentialModel> {

    constructor() {
        super(CredentialDbModel);
    }

    getByUserId(userId: string): Promise<CredentialModel | null> {
        return this.dbModel.findOne({ where: { userid: userId } });
    }

    getByEmail(email: string): Promise<CredentialModel | null> {
        return this.dbModel.findOne({ where: { email: email } });
    }
}

const credentialRepository = new CredentialRepository();

export { CredentialRepository, credentialRepository };

