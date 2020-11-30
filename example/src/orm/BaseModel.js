import SchemaDefinition from './Schema/SchemaDefinition'
import Builder from './Builder/Builder'
import DatabaseLayer from './DatabaseLayer';


export default class BaseModel {
    constructor(props = {}) {
        this.debugLogs = false
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
        return new Builder(this.database, this.tableName, this.schemaDefinition, this.debugLogs)
    }

    get databaseLayer() {
        return new DatabaseLayer(this.database, this.tableName, this.debugLogs)
    }

    get tableName() {
        throw new Error('Table name not defined')
    }

    get schemaDefinition() {
        throw new Error('Schema definition not defined')
    }

    set debugSqlLogs(logs) {
        this.debugLogs = Boolean(logs)
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

    static createTable() {
        return new this().createTable()
    }

    save() {
        const primaryKey = this.schemaDefinition.primaryKey
        const props = this.schemaDefinition.columnsNames.map((column) => this[column])
        if (props[primaryKey]) {
            return this.query().find(props[primaryKey]).update(props)
        }
        return this.query().create(props)
    }
}