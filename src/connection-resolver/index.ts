import DatabaseConnection, { DbTask } from "../interfaces/database-credentials";
import IConnectionResolver from "./connection-resolver.interface";
import EntireDatabaseResolver from "./resolvers/entire-database.resolver";
import DefaultResolver from "./resolvers/default.resolver";

export default class ConnectionResolver {
    private static readonly resolvers: IConnectionResolver[] = [
        new DefaultResolver(),
        new EntireDatabaseResolver(),
    ];

    public static async resolve(task: DbTask): Promise<DatabaseConnection[]> {
        const resolver = this.resolvers.find(resolver => resolver.shouldUse(task));
        if (!resolver) throw new Error(`No resolver found for task ${task.name}`);
        return await resolver.resolve(task);
    }
}