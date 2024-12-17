import {BaseService} from "./BaseService";
import {ExamModel} from "database/model/ExamModel";
import {HttpResponse} from "presentation/HttpResponse";
import {ExamRepository, examRepository} from "database/repository/ExamRepository";

class ExamService extends BaseService<ExamModel, ExamRepository> {
    constructor(examRepository: ExamRepository) {
        super(examRepository);
    }

    async getByUserId(userId: string): Promise<HttpResponse<ExamModel[]>> {
        return new HttpResponse<ExamModel[]>(await this.repository.getByUserId(userId));
    }
}

const examService = new ExamService(examRepository);

export {
    ExamService,
    examService
};