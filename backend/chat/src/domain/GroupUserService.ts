import GroupUserRepository from "../infrastructure/repositories/GroupUserRepository";

class GroupUserService {
    groupUserRepository: GroupUserRepository;

    constructor() {
        this.groupUserRepository = new GroupUserRepository();
    }

    getGroupUsersByUser(userId: string) {
        return this.groupUserRepository.getGroupUsersByUserId(userId);
    }

    getAll() {
        return this.groupUserRepository.getAll();
    }
}

const groupUserService = new GroupUserService();
export default groupUserService;