import DatabaseLayer from "../DatabaseLayer";

const isFunction = (fn) => fn && {}.toString.call(fn) === '[object Function]';

export default class Builder extends DatabaseLayer {

    constructor(database, tableName, schemaDefinition, debugLogs) {
        super(database, tableName, debugLogs)
        this.database = database
        this.tableName = tableName
        this.schemaDefinition = schemaDefinition
        // query builder
        this.selectColumns = new Set
        this.wheres = []
        this.scopedWheres = []
        this.whereValues = []
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
        const freshBuilder = new Builder(this.database, this.tableName, this.schemaDefinition)
        const callBackReturn = fn(freshBuilder)
        const builder = callBackReturn ? callBackReturn : freshBuilder
        this.scopedWheres.push(['AND', builder.wheres])
        return this
    }

    orWhereFunction(fn) {
        const freshBuilder = new Builder(this.database, this.tableName, this.schemaDefinition)
        const callBackReturn = fn(freshBuilder)
        const builder = callBackReturn ? callBackReturn : freshBuilder
        this.scopedWheres.push(['OR', builder.wheres])
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

    concatWhereValue(column, value) {
        const columnSchema = this.schemaDefinition.findColumnByName(column)
        return columnSchema.castToDatabaseValue(value)
    }

    sanitizeWheres() {
        this.wheres = this.wheres.filter(([c]) => typeof this.schemaDefinition.findColumnByName(c) !== 'undefined')
        this.scopedWheres.forEach(([separator, scope], index) => {
            this.scopedWheres[index] = [
                separator,
                scope.filter(([c]) => typeof this.schemaDefinition.findColumnByName(c) !== 'undefined')
            ]
        })
        this.scopedWheres = this.scopedWheres.filter(([_, scope]) => scope.length > 0)
    }

    buildWhere() {
        this.sanitizeWheres()
        const hasWheres = this.wheres.length > 0
        const hasScopedWheres = this.scopedWheres.length > 0
        if (hasScopedWheres || hasWheres) {
            this.query += ' WHERE '
        }
        if (hasScopedWheres) {
            this.query += this.scopedWheres.reduce((q, [s, scope], i) => {
                return `${q} ${i === 0 ? '' : s} (${
                    scope.reduce((sq, [c, o, v, s], j) => {
                        this.whereValues.push(v)
                        return `${sq} ${j === 0 ? '' : s} ${c} ${o} ?`
                    }, '')
                })`
            }, '')
        }
        if (hasWheres) {
            this.query += this.wheres.reduce((q, [c, o, v, s], i) => {
                this.whereValues.push(v)
                return `${q} ${i === 0 && !hasScopedWheres ? '' : s} ${c} ${o} ?`
            }, '')
        }
    }

    buildLimit() {
        if (this.limitRows) {
            this.query += ` LIMIT ${this.limitRows}`
        }
    }

    concatSemicolon() {
        this.query += ';'
    }

    get createTable() {
        this.query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.schemaDefinition.toCreateTableBody});`
        return this.query
    }

    get() {
        this.buildQuery()
        return this.executeSql(this.query).then(({rows: {_array}}) => _array)
    }

    find(primaryKey) {
        this.where(this.schemaDefinition.primaryKey.name, '=', primaryKey)
        return this
    }

    create(props) {
        const columns = Object.keys(props), values = Object.values(props)
        const sql = `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`
        return this.executeSql(sql, values)
    }

}