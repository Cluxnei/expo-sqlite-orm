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
        this.queryValues = []
        this.query = ''
        this.limitRows = null
        this.distinctSelect = false
        this.whereTypes = {
            basic: 'basic',
            scoped: 'scoped',
            'null': 'null',
            notNull: 'notNull',
            'in': 'in',
            notIn: 'notIn',
            raw: 'raw',
        }
    }

    clearQuery() {
        this.query = ''
        this.queryValues = []
    }

    appendWhere(where, type) {
        this.wheres.push({
            ...where,
            type
        })
    }

    where(column, operator, value, separator = 'AND') {
        if (isFunction(column)) {
            return this.whereFunction(column)
        }
        this.appendWhere({
            column,
            operator,
            value,
            separator: separator.toUpperCase()
        }, this.whereTypes.basic)
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
        const {wheres} = callBackReturn ? callBackReturn : freshBuilder
        this.appendWhere({separator: 'AND', wheres}, this.whereTypes.scoped)
        return this
    }

    orWhereFunction(fn) {
        const freshBuilder = new Builder(this.database, this.tableName, this.schemaDefinition)
        const callBackReturn = fn(freshBuilder)
        const {wheres} = callBackReturn ? callBackReturn : freshBuilder
        this.appendWhere({separator: 'OR', wheres}, this.whereTypes.scoped)
        return this
    }

    whereNull(column, separator = 'AND') {
        this.appendWhere({column, separator: separator.toUpperCase()}, this.whereTypes['null'])
        return this
    }

    orWhereNull(column) {
        return this.whereNull(column, 'OR')
    }

    whereNotNull(column, separator = 'AND') {
        this.appendWhere({column, separator: separator.toUpperCase()}, this.whereTypes.notNull)
        return this
    }

    orWhereNotNull(column) {
        return this.whereNotNull(column, 'OR')
    }

    whereIn(column, values, separator = 'AND') {
        this.appendWhere({
            column,
            operator: 'IN',
            separator: separator.toUpperCase(),
            value: this.arrayToInStringList(values.length),
            values
        }, this.whereTypes['in'])
        return this
    }

    orWhereIn(column, values) {
        return this.whereIn(column, values, 'OR')
    }

    whereNotIn(column, values, separator = 'AND') {
        this.appendWhere({
            column,
            operator: 'NOT IN',
            separator: separator.toUpperCase(),
            value: this.arrayToInStringList(values.length),
            values
        }, this.whereTypes.notIn)
        return this
    }

    orWhereNotIn(column, values) {
        return this.whereNotIn(column, values, 'OR')
    }

    whereRaw(expression, separator = 'AND') {
        this.appendWhere({expression, separator: separator.toUpperCase()}, this.whereTypes.raw)
        return this
    }

    orWhereRaw(expression) {
        return this.whereRaw(expression, 'OR')
    }

    arrayToInStringList(numberOfValues = 0) {
        return `(${'?,'.repeat(numberOfValues).substring(0, numberOfValues * 2 - 1)})`
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
        this.clearQuery()
        this.query += `SELECT ${this.distinctSelect ? 'DISTINCT' : ''} ${columns}`
    }

    buildFrom() {
        this.query += ` FROM ${this.tableName}`
    }

    resolveWhereScope(where, skipFirstSeparator = false) {
        let sql = ''
        where.wheres.forEach((w, index) => {
            if (w.type === this.whereTypes.scoped) {
                sql += this.resolveWhereScope(w, index === 0)
            } else {
                sql += this.resolveWhere(w, index === 0)
            }
        })
        return `${skipFirstSeparator ? '' : ` ${where.separator}`} (${sql})`
    }

    resolveWhere(where, skipFirstSeparator = false) {
        const resolves = {
            [this.whereTypes['null']]: (w, skip) =>
                `${skip ? '' : ` ${w.separator}`} ${w.column} IS NULL`,
            [this.whereTypes.notNull]: (w, skip) =>
                `${skip ? '' : ` ${w.separator}`} ${w.column} IS NOT NULL`,
            [this.whereTypes['in']]: (w, skip) => {
                this.queryValues.push(...w.values)
                return `${skip ? '' : ` ${w.separator}`} ${w.column} IN ${w.value}`
            },
            [this.whereTypes.notIn]: (w, skip) => {
                this.queryValues.push(...w.values)
                return `${skip ? '' : ` ${w.separator}`} ${w.column} NOT IN ${w.value}`
            },
            [this.whereTypes.raw]: (w, skip) =>
                `${skip ? '' : ` ${w.separator}`} ${w.expression}`
        }
        if (where.type in resolves) {
            return resolves[where.type](where, skipFirstSeparator)
        }
        this.queryValues.push(where.value)
        return `${skipFirstSeparator ? '' : ` ${where.separator}`} ${where.column} ${where.operator} ?`
    }

    buildWhere() {
        if (this.wheres.length === 0) {
            return
        }
        let sql = ''
        this.wheres.forEach((where, index) => {
            if (where.type === this.whereTypes.scoped) {
                sql += this.resolveWhereScope(where, index === 0)
            } else {
                sql += this.resolveWhere(where, index === 0)
            }
        })
        this.query += ` WHERE ${sql}`
    }

    buildLimit() {
        if (this.limitRows) {
            this.queryValues.push(this.limitRows)
            this.query += ` LIMIT ?`
        }
    }

    concatSemicolon() {
        this.query += ';'
    }

    get createTable() {
        return `CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.schemaDefinition.toCreateTableBody});`
    }

    get() {
        this.buildQuery()
        return this.executeSql(this.query, this.queryValues).then(({rows: {_array}}) => _array)
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