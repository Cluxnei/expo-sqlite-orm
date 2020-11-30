const isFunction = (fn) => fn && {}.toString.call(fn) === '[object Function]';
export default class Builder {
    constructor(database, tableName, schemaDefinition) {
        this.database = database
        this.tableName = tableName
        this.schemaDefinition = schemaDefinition
        // query builder
        this.selectColumns = new Set
        this.wheres = []
        this.query = ''
        this.limitRows = null
        this.distinctSelect = false
    }

    where(column, operator, value, separator = 'AND') {
        if (isFunction(column)) {
            return this.whereFunction(column)
        }
        if (this.wheres.find(([c, o, v]) => c === column && o === operator && v === value)) {
            return this
        }
        this.wheres.push([column, operator, value, separator.toUpperCase()])
        return this
    }

    orWhere(column, operator, value) {
        if (isFunction(column)) {
            return this.orWhereFunction(column)
        }
        return this.where(column, operator, value, 'OR')
    }

    whereFunction(fn) {
        return this
    }

    orWhereFunction(fn) {
        return this
    }

    select(...columns) {
        columns.forEach((column) => this.selectColumns.add(column))
        return this
    }

    selectRaw(expression) {
        this.selectColumns.add(expression)
        return this
    }

    limit(count) {
        if (count) {
            this.limitRows = count
        }
        return this
    }

    distinct(...columns) {
        this.selectColumns.clear()
        this.select(...columns)
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
        this.buildWhere()
        this.buildLimit()
        this.concatSemicolon()
    }

    buildSelect() {
        if (this.selectColumns.size === 0) {
            this.selectColumns.add('*')
        }
        const columns = [...this.selectColumns].join(',')
        this.query = `SELECT ${this.distinctSelect ? 'DISTINCT' : ''} ${columns}`
    }

    buildFrom() {
        this.query += ` FROM ${this.tableName}`
    }

    buildWhere() {
        if (this.wheres.length === 0) {
            return
        }
        const [_c, _o, _v] = this.wheres.shift()
        this.query += ` WHERE ${_c} ${_o} ${_v}`
        this.query += this.wheres.reduce((q, [c, o, v, s]) => `${q} ${s} ${c} ${o} ${v}`, '')
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