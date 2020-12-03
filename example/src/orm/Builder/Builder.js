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
        this.isCount = false
        this.isDestroy = false
        this.wheres = []
        this.queryValues = []
        this.query = ''
        this.orderByColumns = new Set
        this.isOrderByDesc = false
        this.groupByColumns = new Set
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

    orderBy(...columns) {
        this.isOrderByDesc = false
        this.orderByColumns.clear()
        columns.forEach((column) => {
            this.orderByColumns.add(column)
        })
        return this
    }

    orderByDesc(...columns) {
        this.orderBy(...columns)
        this.isOrderByDesc = true
        return this
    }

    groupBy(...columns) {
        this.groupByColumns.clear()
        columns.forEach((column) => {
            this.groupByColumns.add(column)
        })
        return this
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

    count(column) {
        const countColumn = column ? column : this.schemaDefinition.primaryKey.name
        this.selectColumns.clear()
        this.selectColumns.add(countColumn)
        this.isCount = true
        return this.get().then(([first]) => {
            if (typeof first === 'object') {
                return Object.values(first)[0]
            }
            return typeof first === 'undefined' ? 0 : -1
        })
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
        this.buildDelete()
        this.buildFrom()
        this.buildWhere()
        this.buildGroupBy()
        this.buildOrderBy()
        this.buildLimit()
        this.concatSemicolon()
    }

    buildSelect() {
        if (this.selectColumns.size === 0) {
            this.selectColumns.add('*')
        }
        const columns = [...this.selectColumns].join(',')
        this.clearQuery()
        if (this.isCount) {
            this.query += `SELECT COUNT(${this.distinctSelect ? 'DISTINCT ' : ''}${[...this.selectColumns][0]})`
        } else {
            this.query += `SELECT ${this.distinctSelect ? 'DISTINCT' : ''} ${columns}`
        }
    }

    buildDelete() {
        if (this.isDestroy) {
            this.clearQuery()
            this.query += 'DELETE'
        }
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

    buildGroupBy() {
        if (this.groupByColumns.size > 0) {
            this.query += ` GROUP BY ${[...this.groupByColumns].join(',')}`
        }
    }

    buildOrderBy() {
        if (this.orderByColumns.size > 0) {
            this.query += ` ORDER BY ${[...this.orderByColumns].join(',')} ${this.isOrderByDesc ? 'DESC' : 'ASC'}`
        }
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

    get dropTable() {
        return `DROP TABLE IF EXISTS ${this.tableName};`
    }

    get() {
        this.buildQuery()
        return this.executeSql(this.query, this.queryValues).then(({rows: {_array}}) => _array)
    }

    execute() {
        this.buildQuery()
        return this.executeSql(this.query, this.queryValues).then((result) => result)
    }

    find(primaryKey) {
        this.where(this.schemaDefinition.primaryKey.name, '=', primaryKey)
        return this
    }

    first() {
        this.limit(1)
        return this.get().then(([first]) => first)
    }

    sanitizeValues(props, columns) {
        const _columns = columns ? columns : Object.keys(props)
        return _columns.map((column) => {
            const schema = this.schemaDefinition.findColumnByName(column)
            if (schema.isJson() && typeof props[column] !== 'string') {
                return JSON.stringify(props[column])
            }
            if (schema.isBoolean()) {
                return Boolean(props[column]) ? 1 : 0
            }
            if (schema.isTimestampcolumn && schema.isUseCurrent) {
                return new Date().toISOString()
            }
            return props[column]
        })
    }

    generateInsertSql(columns, many = false, insertCount = 0) {
        if (many) {
            const values = `(${columns.map(() => '?').join(',')}),`.repeat(insertCount)
            return `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES ${values.substring(0, values.length - 1)}`
        }
        return `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`
    }

    create(props) {
        const columns = Object.keys(props)
        const sql = this.generateInsertSql(columns)
        const values = this.sanitizeValues(props, columns)
        return this.executeSql(sql, values).then(({insertId}) => insertId)
    }

    createMany(arrayOfProps) {
        const columns = Object.keys(arrayOfProps[0])
        const columnsLength = columns.length
        const values = arrayOfProps.map((props) => this.sanitizeValues(props))
        const t = values.length - 1
        for (let i = 0; i < t; i++) {
            const l = values[i].length, m = values[i + 1].length
            if (l !== m || l !== columnsLength || m !== columnsLength) {
                throw new Error('Multiple insert must have same props values length in all entries')
            }
        }
        const singleLevelValues = []
        values.forEach((value) => {
            singleLevelValues.push(...value)
        })
        const sql = this.generateInsertSql(columns, true, values.length)
        return this.executeSql(sql, singleLevelValues)
    }

    destroy() {
        this.isDestroy = true
        this.buildQuery()
        return this.execute().then(({rowsAffected}) => rowsAffected)
    }

}