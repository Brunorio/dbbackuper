import IConnectionResolver from "../connection-resolver.interface";
import DatabaseConnection, { DbTask } from "../../interfaces/database-credentials";
import mysql from 'mysql2/promise';

export default class EntireDatabaseResolver implements IConnectionResolver {
    shouldUse(task: DbTask): boolean {
        return task.database === '' || task.database === undefined;
    }

    async resolve(task: DbTask): Promise<DatabaseConnection[]> {
        const connection = await this.getConnection(task);
        const [databases] = await connection.query("SHOW DATABASES WHERE `Database` NOT IN ('information_schema', 'performance_schema', 'sys', 'mysql')");
        return (databases as any[]).map(({ Database }: { Database: string }) => ({
            name: task.name,
            user: task.user,
            password: task.password,
            host: task.host,
            port: task.port,
            database: Database,
        }));
    }

    private async getConnection(task: DbTask): Promise<mysql.Connection> {
        return mysql.createConnection({
            host: task.host,
            user: task.user,
            password: task.password,
            port: task.port,
        });
    }
}