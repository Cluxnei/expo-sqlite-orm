export default class Builder {
    constructor(database, tableName, schemaDefinition) {
        this.database = database
        this.tableName = tableName
        this.schemaDefinition = schemaDefinition
        // query builder
        this.selectCollumns = new Set
        this.query = ''
    }

    select(...collumns) {
        collumns.forEach((collumn) => this.selectCollumns.add(collumn))
        return this
    }

    toSql() {
        this.buildQuery()
        return this.query
    }

    buildQuery() {
        this.buildSelect()
        this.buildFrom()
        this.concatSemicolon()
    }

    buildSelect() {
        if (this.selectCollumns.size === 0) {
            this.selectCollumns.add('*')
        }
        const collumns = [...this.selectCollumns].join(',')
        this.query = `SELECT ${collumns}`
    }

    buildFrom() {
        this.query += ` FROM ${this.tableName}`
    }

    concatSemicolon() {
        this.query += ';'
    }

}