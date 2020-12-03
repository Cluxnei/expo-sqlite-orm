import SchemaDefinition from './Schema/SchemaDefinition'
import Builder from './Builder/Builder'
import DatabaseLayer from './DatabaseLayer';


export default class BaseModel {
    constructor(props = {}) {
        this.__debugLogs = false
        this.setProperties(props)
    }

    setProperties(props) {
        this.schemaDefinition.columnsNames.forEach((columnName) => {
            this[columnName] = props[columnName] !== undefined ? props[columnName] : null
        })
    }

    get database() {
        throw new Error('Database not defined')
    }

    get builder() {
        return new Builder(this.database, this.tableName, this.schemaDefinition, this.__debugLogs)
    }

    get databaseLayer() {
        return new DatabaseLayer(this.database, this.tableName, this.__debugLogs)
    }

    get tableName() {
        throw new Error('Table name not defined')
    }

    get schemaDefinition() {
        throw new Error('Schema definition not defined')
    }

    set __debugSqlLogs(logs) {
        this.__debugLogs = Boolean(logs)
    }

    tableDefinition() {
        return new SchemaDefinition()
    }

    query() {
        return this.builder
    }

    static query() {
        return new this().query()
    }

    createTable() {
        return this.builder.executeSql(this.builder.createTable).then(() => true).catch(() => false)
    }

    dropTable() {
        return this.builder.executeSql(this.builder.dropTable).then(() => true).catch(() => false)
    }

    static createTable() {
        return new this().createTable()
    }

    static dropTable() {
        return new this().dropTable()
    }

    static async createMany(arrayOfProps) {
        const _this = new this()
        const result = await _this.query().createMany(arrayOfProps)
        console.log(result)
    }

    static async create(props) {
        if (Array.isArray(props)) {
            return this.createMany(props)
        }
        const _this = new this()
        const insertId = await _this.query().create(props)
        if (insertId) {
            return _this.query().find(insertId).first();
        }
        return false
    }

    async save() {
        const primaryKey = this.schemaDefinition.primaryKey
        const props = {}
        this.schemaDefinition.columnsNames.forEach((column) => {
            props[column] = this[column]
        })
        if (props[primaryKey]) {
            return this.query().find(props[primaryKey]).update(props)
        }
        const insertId = await this.query().create(props)
        if (insertId) {
            this[primaryKey] = insertId
            return true
        }
        return false
    }
}