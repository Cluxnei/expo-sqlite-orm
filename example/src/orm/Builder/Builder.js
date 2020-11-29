export default class Builder {
    constructor(database, tableName, schemaDefinition) {
        this.database = database
        this.tableName = tableName
        this.schemaDefinition = schemaDefinition
        // query builder
        this.selectCollumns = new Set
        this.query = ''
        this.limitRows = null
        this.distinctSelect = false
    }

    select(...collumns) {
        collumns.forEach((collumn) => this.selectCollumns.add(collumn))
        return this
    }

    selectRaw(expression) {
        this.selectCollumns.add(expression)
        return this
    }

    limit(count) {
        if (count) {
            this.limitRows = count
        }
        return this
    }

    distinct(...collumns) {
        this.selectCollumns.clear()
        this.select(...collumns)
        this.distinctSelect = true
        return this
    }

    toSql() {
        this.buildQuery()
        return this.query
    }

    buildQuery() {
        this.buildSelect()
        this.buildFrom()
        this.buildLimit()
        this.concatSemicolon()
    }

    buildSelect() {
        if (this.selectCollumns.size === 0) {
            this.selectCollumns.add('*')
        }
        const collumns = [...this.selectCollumns].join(',')
        this.query = `SELECT ${this.distinctSelect ? 'DISTINCT' : ''} ${collumns}`
    }

    buildFrom() {
        this.query += ` FROM ${this.tableName}`
    }

    buildLimit() {
        if (this.limitRows) {
            this.query += ` LIMIT ${this.limitRows}`
        }
    }

    concatSemicolon() {
        this.query += ';'
    }

}