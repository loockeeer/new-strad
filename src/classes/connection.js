import mysql from 'mysql';
import { client } from '../globals';

/**
 * @type   {Connection}
 * @param  {String} host
 * @param  {String} user
 * @param  {String} password
 * @param  {String} database
 */
class Connection {
    constructor(host, user, password, database) {
        this.core = mysql.createConnection({
            host,
            user,
            password,
            database,
            charset: 'utf8_general_ci'
        });
        this.core.connect(error => {
            if (error) throw error;
        });
    }

    static getInstance() {
        if (typeof this.instance === 'undefined' || this.instance.core.state === 'disconnected') {
            this.instance = new Connection(
                client.config.mysqlHost,
                client.config.mysqlUser,
                client.config.mysqlPass,
                client.config.mysqlDB
            );
        }

        return this.instance;
    }

    /**
     * @param  {String} sql
     */
    async query(sql) {
        return await new Promise((resolve, reject) => {
            this.core.query(sql, (error, rows) => {
                if (error) reject(error);
                resolve(rows);
            });
        });
    }

    end() {
        this.core.end();
    }
}

export { Connection };
