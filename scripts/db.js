var mysql = require("mysql");

exports.Connection = class Connection {

    constructor(host, user, pass, dbname) {
        this.core = mysql.createConnection({
            host: host,
            user: user,
            password: pass,
            database: dbname
        });
        this.core.connect((err) => {
            if (err) throw err;
        });
    }

    query(sql, datagate={}, callback) {
        this.core.query(sql, function (err, rows) {
            if (err) throw err;
            callback(rows, datagate);
        });
    }

    end() {
        this.core.end();
    }

};