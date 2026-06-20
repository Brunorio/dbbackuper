import DatabaseConnection, { DbTask } from "../../interfaces/database-credentials";
import IConnectionResolver from "../connection-resolver.interface";

export default class DefaultResolver implements IConnectionResolver {
    shouldUse(task: DbTask): boolean {
        return task.database !== '' && task.database !== undefined;
    }

    async resolve(task: DbTask): Promise<DatabaseConnection[]> {
        return [
            {
                name: task.name,
                user: task.user,
                password: task.password,
                host: task.host,
                port: task.port,
                database: task.database!,
            },
        ];
    }
}