import {CredentialEntity} from "domain/entity/CredentialEntity";
import {ResetPasswordEntity} from "../domain/entity/ResetPasswordEntity";
import {createClient} from 'redis';

class Redis {

    instance: ReturnType<typeof createClient>;


    constructor() {
        this.instance = this.createClient();
        this.handleEvent();
        this.connect();
    }

    /**
     * Create a redisClient instance
     * @return The created instance
     */
    createClient() : ReturnType<typeof createClient> {
        return createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: 6379
            }
        });
    }

    /**
     * Handle redisClient event (connect and error)
     */
    handleEvent() {
        this.instance.on('connect', () => {
            // eslint-disable-next-line no-restricted-syntax
            console.log('Connected to Redis as publisher.');
        });

        this.instance.on('error', (err: Error) => {
            console.error('Redis error:', err);
        });
    }

    /**
     * Get the value thanks to its key
     * @param key The searched key
     * @return The associated value
     * @async
     */
    async getCredentialEntity(key: string) {
        const credentials = await this.instance.get(key);
        if (!credentials) {
            return null;
        }
        return JSON.parse(credentials) as CredentialEntity;
    }

    async getResetProcessEntity(key: string) {
        const entity = await this.instance.get(key);
        if (!entity) {
            return null;
        }
        return JSON.parse(entity) as ResetPasswordEntity;
    }

    /**
     * Set a value thanks to its key
     * @param key The key to set
     * @param value The associated value
     * @async
     */
    set(key: string, value: CredentialEntity | ResetPasswordEntity) {
        return this.instance.set(key, JSON.stringify(value));
    }

    delete(key: string) {
        return this.instance.del(key);
    }

    /**
     * Establish the connection to Redis
     */
    connect() {
        return this.instance.connect();
    }
}

export { Redis };