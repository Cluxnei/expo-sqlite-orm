import SchemaDefinition from './Schema/SchemaDefinition'
import Builder from './Builder/Builder'
import DatabaseLayer from "./DatabaseLayer";


export default class BaseModel {
    constructor(props = {}) {
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
        return new Builder(this.database, this.tableName, this.schemaDefinition)
    }

    get databaseLayer() {
        return new DatabaseLayer(this.database, this.tableName)
    }

    get tableName() {
        throw new Error('Table name not defined')
    }

    get schemaDefinition() {
        throw new Error('Schema definition not defined')
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
        return this.databaseLayer.executeSql(this.builder.createTable).then(() => true).catch(() => false)
    }

    static createTable() {
        return new this().createTable()
    }
}