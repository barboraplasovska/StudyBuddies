import { ErrorResponse } from "utils/ErrorResponse";
import { HttpError } from "utils/errors/HttpError";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import { ExamModel } from "database/model/ExamModel";
import { ExamService } from "domain/service/ExamService";
import {examRepository, ExamRepository} from "database/repository/ExamRepository";

describe("ExamService", () => {

    const dbModel: ExamModel = { id: "1", name: "Test Exam", description: "This is a description", userId: "1", date: "20-12-2028" } as ExamModel;
    const examService = new ExamService(examRepository);

    afterAll(() => {
        jest.restoreAllMocks();
    })

    it('getAll should return a list of all the exams and a status code of 200', async () => {
        const expectedResponse : ExamModel[] = [dbModel];
        const getAllMock = jest.spyOn(ExamRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await examService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getAll should return an empty list with a status code 200', async () => {
        const expectedResponse : ExamModel[] = [];
        const getAllMock = jest.spyOn(ExamRepository.prototype, 'getAll');
        getAllMock.mockResolvedValue(expectedResponse);

        const result = await examService.getAll();

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('get authenticated user exams should return a list of all the exams and a status code of 200', async () => {
        const expectedResponse : ExamModel[] = [dbModel];
        const getMyMock = jest.spyOn(ExamRepository.prototype, 'getByUserId');
        getMyMock.mockResolvedValue(expectedResponse);

        const result = await examService.getByUserId('1');

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return the expected object with a status code of 200', async () => {
        const expectedResponse : ExamModel = dbModel;
        const getByIdMock = jest.spyOn(ExamRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(expectedResponse);

        const result = await examService.getById(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('getById should return Not Found with a status code of 404', async () => {
        const getByIdMock = jest.spyOn(ExamRepository.prototype, 'getById');
        getByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await examService.getById(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('updateById should return the expected object with a status code of 200', async () => {
        const expectedResponse : ExamModel = dbModel;
        const updateByIdMock = jest.spyOn(ExamRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(expectedResponse);

        const result = await examService.updateById(dbModel.id, dbModel);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('updateById should return Not Found with a status code of 404', async () => {
        const updateByIdMock = jest.spyOn(ExamRepository.prototype, 'updateById');
        updateByIdMock.mockResolvedValue(null);

        await expect(async () => {
            await examService.updateById(dbModel.id, dbModel);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });

    it('insert should return the expected object with a status code of 201', async () => {
        const expectedResponse : ExamModel = dbModel;
        const insertMock = jest.spyOn(ExamRepository.prototype, 'insert');
        insertMock.mockResolvedValue(expectedResponse);

        const result = await examService.insert(dbModel);

        expect(result.statusCode).toEqual(201);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return the expected object with a status code of 200', async () => {
        const expectedResponse : ExamModel = dbModel;
        const deleteMock = jest.spyOn(ExamRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(expectedResponse);

        const result = await examService.delete(dbModel.id);

        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual(expectedResponse);
    });

    it('delete should return Not Found with a status code of 404', async () => {
        const expectedResponse : ErrorResponse = { error: "Not Found." };
        const deleteMock = jest.spyOn(ExamRepository.prototype, 'delete');
        deleteMock.mockResolvedValue(null);

        await expect(async () => {
            await examService.delete(dbModel.id);
        }).rejects.toMatchObject(new HttpError(ErrorEnum.NOT_FOUND, "Not Found."));
    });
})
