/**
 * Created by simengzhao on 2017/7/27.
 */
const dbconfig = require('./sydbconfig');
const jdbc = require('jdbc');
const jinst = require('jdbc/lib/jinst');
const async = require('async');

console.log(__dirname);
if (!jinst.isJvmCreated()) {
    jinst.addOption('-Xrs');
    console.log(__dirname);
    jinst.setupClasspath([dbconfig.driverDir]);
}
const config = dbconfig.dbconfig;
const query_s = [];
const sybasedb = new jdbc(config);
const errList = {
    InserNotMatch: 'Insert error, column name or number of supplied values does not match table definition.',
    IdExist: 'Attempt to insert duplicate key row in object',
};

sybasedb.initialize((err) => {
    if (err) {
        console.log(err.message);
    }
});

function Update(sql, callupdate) {
    sybasedb.reserve((err, connObj) => {
        if (connObj) {
            console.log(`using connobj ${connObj.uuid}`);
            const conn = connObj.conn;
            conn.createStatement((err, statement) => {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    statement.executeUpdate(sql, (err, count) => {
                        callupdate(err, count);
                    });
                }
            });

            sybasedb.release(connObj, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            callupdate(err);
            console.log(err);
        }
    });
}
function p_query_s() {
    this.query_s = [];
}
p_query_s.prototype.query = (sql)=> {
    query_s.push(sql);
};

p_query_s.prototype.execute = async () => {
    const res = await new Promise((resolve, reject) => {
        console.log(query_s)

        sybasedb.reserve((err0, connObj) => {
            if (connObj) {
                console.log(`using connobj ${connObj.uuid}`);
                const conn = connObj.conn;
                conn.createStatement((err1, statement) => {
                    if (err1) {
                        console.log(err1);
                        reject(err1);
                    } else {
                        let  funs = [];

                        for (const i in query_s) {
                            const sql = query_s[i];
                            if (sql=='')
                                continue
                            funs.push((callback) => {
                                statement.executeUpdate(sql, (err2, count) => {
                                    console.log(sql)
                                    if (err2) {
                                        console.log('err2:');

                                        const messarr = err2.message.split('\n');
                                        const key = messarr[1].split(':').slice(1).join();

                                        console.log(key)
                                        const errx = {
                                            num: 'err2',
                                            key,
                                        };
                                        callback(errx);
                                    }

                                    callback(null, count);
                                });
                            });
                        }
                        async.series(funs, (err, res) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(res);
                            }
                        });
                    }
                });
                sybasedb.release(connObj, (err3) => {
                    if (err3) {
                        reject(err3);
                        console.log(err3);
                    }
                });
            } else {
                console.log(err0);
                reject(err0);
            }
        });
    }).catch((err) => {

        // for (const k in errList) {
        //     if (err.key.contains(errList[k])) {
        //         console.log(k);
        //     }
        // }
    });
    query_s = []
    return res;
};
async function p_update(sql) {
    const res = await new Promise((resolve, reject) => {
        sybasedb.reserve((err0, connObj) => {
            if (connObj) {
                console.log(`using connobj ${connObj.uuid}`);
                const conn = connObj.conn;
                conn.createStatement((err1, statement) => {
                    if (err1) {
                        console.log(err1);
                        reject(err1);
                    } else {
                        statement.executeUpdate(sql, (err2, count) => {
                            if (err2) {
                                console.log('err2:');

                                const messarr = err2.message.split('\n');

                                const key = messarr[1].split(':').slice(1).join();
                                console.log(sql)
                                console.log(key)

                                const errx = {
                                    num: 'err2',
                                    key,
                                };
                                reject(errx);
                            }
                            resolve(count);
                        });
                    }
                });
                sybasedb.release(connObj, (err3) => {
                    if (err3) {
                        reject(err3);
                        console.log(err3);
                    }
                });
            } else {
                console.log(err0);
                reject(err0);
            }
        });
    }).catch((err) => {
        for (const k in errList) {
            if (err.key.contains(errList[k])) {
                console.log(k);
            }
        }
    });
    return res;
}
async function p_select(sql) {
    const res = await new Promise((resolve, reject) => {
        sybasedb.reserve((err0, connObj) => {
            if (err0) {
                reject(err0);
                console.log(err0);
            } else {
                console.log(sql);
                const conn = connObj.conn;
                conn.createStatement((err1, statement) => {
                    if (err1) {
                        console.log(err1);
                        reject(err1);
                        return
                    }
                    statement.executeQuery(sql, (err2, result) => {
                        if (err2) {
                            console.log(err2.message);
                            reject(err2);
                        }
                        if (result) {
                            result.toObjArray((err3, resset) => {
                                if (err3) {
                                    console.log(err3.message);
                                    reject(err3);
                                }
                                resolve(resset);
                            });
                        }
                    });
                });
                sybasedb.release(connObj, (err4) => {
                    if (err4) {
                        reject(err4);
                        console.log(err4);
                    }
                });
            }
        });
    });

    return res;
}

// Create tables needed if not exist
function DBinitlize(callback) {
    const drop = {
        MOD_ARROW: 'DROP TABLE MOD_ARROW',
        MOD_BODY: 'DROP TABLE MOD_BODY\n',
        MOD_ECM: 'DROP TABLE MOD_ECM\n',
        MOD_HEADER: 'DROP TABLE MOD_HEADER\n',
        MOD_JOINT:
        'DROP TABLE MOD_JOINT\n',
        MOD_LOGIC:
        'DROP TABLE MOD_LOGIC\n',
        MOD_LOGIC_NODE:
        'DROP TABLE MOD_LOGIC_NODE',
    };
    const sql = {
        MOD_ECM: `CREATE TABLE MOD_ECM (
  id INT PRIMARY KEY ,
  title VARCHAR(200) not null ,
  description VARCHAR(400) NOT NULL ,
  caseReason VARCHAR(200) NOT NULL ,
  caseNumber VARCHAR(100) NOT NULL,
  manageJudge VARCHAR(100) NOT NULL ,
  courtClerk VARCHAR(100) NOT NULL ,
  startDate DATE NOT NULL ,
  endDate DATE NULL
)`,
        MOD_LOGIC: `CREATE TABLE MOD_LOGIC (
  id INT PRIMARY KEY ,
  title VARCHAR(200) not null ,
  description VARCHAR(400) NOT NULL ,
  caseReason VARCHAR(200) NOT NULL ,
  caseNumber VARCHAR(100) NOT NULL,
  manageJudge VARCHAR(100) NOT NULL ,
  courtClerk VARCHAR(100) NOT NULL ,
  startDate DATE NOT NULL ,
  endDate DATE NULL
)`,
        MOD_ARROW:
        'CREATE TABLE MOD_ARROW (\n' +
        '  name VARCHAR(100) not null  ,\n' +
        '  content VARCHAR(100) NOT NULL  ,\n' +
        '  ownerID INT NOT NULL   ,\n' +
        '  sonID INT NOT NULL ,\n' +
        '  relativeID INT NOT NULL   ,\n' +
        '  ecmID INT NOT NULL   \n' +
        ')\n',
        MOD_HEADER:
        'CREATE TABLE MOD_HEADER(\n' +
        '  name VARCHAR(100) not null  ,\n' +
        '  keySentence VARCHAR(100) NOT NULL   ,\n' +
        '  content VARCHAR(100) NOT NULL  ,\n' +
        '  ownerID INT NOT NULL   ,\n' +
        '  relativeID INT NOT NULL   ,\n' +
        '  ecmID INT NOT NULL   \n' +
        ')\n',
        MOD_JOINT:
        'CREATE TABLE MOD_JOINT(\n' +
        '  name VARCHAR(100) not null  ,\n' +
        '  content VARCHAR(100) NOT NULL  ,\n' +
        '  relativeID INT NOT NULL   ,\n' +
        '  ecmID INT NOT NULL   \n' +
        ')\n',
        MOD_BODY:
        'CREATE TABLE MOD_BODY (\n' +
        '  name VARCHAR(100) not null  ,\n' +
        '  evidenceType VARCHAR(100) NOT NULL  ,\n' +
        '  committer VARCHAR(100) NOT NULL  ,\n' +
        '  evidenceReason VARCHAR(100) NOT NULL  ,\n' +
        '  evidenceConclusion VARCHAR(100) NOT NULL  ,\n' +
        '  content VARCHAR(100) NOT NULL  ,\n' +
        '  relativeID INT NOT NULL   ,\n' +
        '  ecmID INT NOT NULL   \n' +
        ')\n',
        MOD_LOGIC_NODE:
        'CREATE TABLE MOD_LOGIC_NODE (\n' +
        '  topic VARCHAR(100) NOT NULL  ,\n' +
        '  type VARCHAR(100) NOT NULL  ,\n' +
        '  detail VARCHAR(100) NOT NULL  ,\n' +
        '  leadTo INT NOT NULL   ,\n' +
        '  logicID INT NOT NULL   ,\n' +
        '  relativeID INT NOT NULL   \n' +
        ')',
    };
    const f_series = [];
    const d_series = [];
    for (const tname in sql) {
        d_series.push((callback) => {
            Update(drop[tname], (err, count) => {
                if (err) {
                    console.log(`ERROR OCCURRED IN DROP TABLE ${tname} : ${err.message}`);
                } else {
                    console.log(`TABLE ${tname} DROPPED SUCCESSFULLY`);
                }
                callback(null, count);
            });
        });
        f_series.push((callback) => {
            Update(sql[tname], (err, count) => {
                if (err) {
                    console.log(`ERROR  OCCURRED IN CREATE ${tname} : ${err.message}`);
                } else {
                    console.log(`TABLE ${tname} CREATED SUCCESSFULLY `);
                }
                callback(null, count);
            });
        });
    }
    const task_que = d_series.concat(f_series);
    async.series(task_que, (err, result) => {
        if (err) {
            console.log(`drop series error${err.message}`);
        } else {
            callback(result);
        }
    });
}
module.exports = {
    p_select,
    p_update,
    DBinitlize,
    p_query_s,
};
