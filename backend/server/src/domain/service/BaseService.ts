import { BaseRepository } from "database/repository/BaseRepository";
import { ErrorEnum } from "utils/enumerations/ErrorEnum";
import { HttpError } from "utils/errors/HttpError";
import { HttpResponse } from "presentation/HttpResponse";
import { Model } from "sequelize";

class BaseService<M extends Model, T extends BaseRepository<M>> {
  protected repository: T;

  constructor(repository: T) {
    this.repository = repository;
  }

  async getAll(): Promise<HttpResponse<M>> {
    return new HttpResponse(await this.repository.getAll());
  }

  async getById(id: string): Promise<HttpResponse<M>> {
    const result = await this.repository.getById(id);
    if (result === null) {
      throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
    }
    return new HttpResponse<M>(result);
  }

  async updateById(id: string, body: object): Promise<HttpResponse<M>> {
    const result = await this.repository.updateById(id, body);
    if (result === null) {
      throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
    }
    return new HttpResponse<M>(result);
  }

  async insert(body: M): Promise<HttpResponse<M>> {
    const result = await this.repository.insert(body);
    return new HttpResponse<M>(result, 201);
  }

  async delete(id: string): Promise<HttpResponse<M>> {
    const result = await this.repository.delete(id);
    if (result === null) {
      throw new HttpError(ErrorEnum.NOT_FOUND, "Not Found.");
    }
    return new HttpResponse<M>(result);
  }
}

export { BaseService };

