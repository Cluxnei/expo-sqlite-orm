import SchemaDefinition from './Schema/SchemaDefinition'
import Builder from './Builder/Builder'


export default class BaseModel {
    constructor(props = {}) {
        this.setProperties(props)
    }

    setProperties(props) {
        this.schemaDefinition.collumnsNames.forEach((collumnName) => {
            this[collumnName] = props[collumnName] !== undefined ? props[collumnName] : null
        })
    }

    get database() {
        throw new Error('Database not defined')
    }

    get builder() {
        return new Builder(this.database, this.tableName, this.schemaDefinition)
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
}