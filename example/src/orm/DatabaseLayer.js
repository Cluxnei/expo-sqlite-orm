export default class DatabaseLayer {
    constructor(database, tableName) {
        this.database = database
        this.tableName = tableName
    }

    async executeBulkSql(sqls, params = []) {
        const database = await this.database()
        return new Promise((txResolve, txReject) => {
            database.transaction(tx => {
                Promise.all(sqls.map((sql, index) => {
                    return new Promise((sqlResolve, sqlReject) => {
                        tx.executeSql(
                            sql,
                            params[index],
                            (_, result) => {
                                if (__DEV__) {
                                    console.log(`[SQL OK]: ${sql}`)
                                }
                                sqlResolve(result)
                            },
                            (_, error) => {
                                if (__DEV__) {
                                    console.warn(`[SQL ERROR]: ${error}`)
                                }
                                sqlReject(error)
                            }
                        )
                    })
                })).then(txResolve).catch(txReject)
            })
        })
    }

    async executeSql(sql, params = []) {
        return this.executeBulkSql([sql], [params])
            .then(res => res[0])
            .catch(error => { throw error })
    }


}