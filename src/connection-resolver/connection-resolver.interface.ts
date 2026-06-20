import DatabaseConnection, { DbTask } from "../interfaces/database-credentials";

export default interface IConnectionResolver {
    shouldUse(task: DbTask): boolean;
    resolve(task: DbTask): Promise<DatabaseConnection[]>;
}