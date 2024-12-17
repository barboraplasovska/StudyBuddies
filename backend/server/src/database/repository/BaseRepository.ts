/* eslint-disable */

import {Model} from "sequelize";

class BaseRepository<T extends Model> {
    protected dbModel : any;

    constructor(model : any) {
        this.dbModel = model;
    }

    getAll(): Promise<T[]> {
        return this.dbModel.findAll({raw: true});
    }

    getById(id: string): Promise<T | null> {
        return this.dbModel.findByPk(id, {
            raw: true
        });
    }

    insert(body: T): Promise<T> {
        return this.dbModel.create(body);
    }

    async updateById(
        id: string,
        body: object,
    ): Promise<T | null> {
        const object = await this.dbModel.findByPk(id);
        if (object == null)
            return null;
        try {
            return object.update(body);
        }
        catch {
            return null;
        }
    }

    async delete(id: string): Promise<T | null> {
        const object = await this.dbModel.findByPk(id);
        if (object == null)
            return null;
        return object.destroy();
    }
}

export { BaseRepository };

