import {BaseRepository} from "./BaseRepository";
import {ExamDbModel, ExamModel} from "database/model/ExamModel";

class ExamRepository extends BaseRepository<ExamModel> {
    constructor() {
        super(ExamDbModel);
    }

    getByUserId(userId: string): Promise<ExamModel[]> {
        return this.dbModel.findAll({ where: { userId: userId } });
    }
}

const examRepository = new ExamRepository();

export {
    ExamRepository,
    examRepository
};