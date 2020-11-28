import Collumn from './Collumn'

export default class SchemaDefinition {
    constructor() {
        this.collumns = new Set()
        this.types = {
            INTEGER: 'INTEGER',
            FLOAT: 'FLOAT',
            TEXT: 'TEXT',
            NUMERIC: 'NUMERIC',
            DATE: 'DATE',
            DATETIME: 'DATETIME',
            BOOLEAN: 'BOOLEAN',
            JSON: 'JSON'
        }
    }

    appendCollumn(name, type) {
        const collumn = new Collumn(name, type)
        this.collumns.add(collumn)
        return collumn
    }

    // Abbreviations

    id() {
        return this.integer('id').primaryKey().autoIncrement()
    }

    int(collumnName) {
        return this.integer(collumnName)
    }

    double(collumnName) {
        return this.float(collumnName)
    }

    bool(collumnName) {
        return this.boolean(collumnName)
    }

    string(collumnName) {
        return this.text(collumnName)
    }

    timestamps(createdAtCollumnName = 'createdAt', updatedAtCollumnName = 'updatedAt') {
        this.dateTime(createdAtCollumnName).default(new Date().getTime()).timestampCollumn()
        this.dateTime(updatedAtCollumnName).nullAble().timestampCollumn()
    }


    // Collumn types

    integer(collumnName) {
        return this.appendCollumn(collumnName, this.types.INTEGER)
    }

    text(collumnName) {
        return this.appendCollumn(collumnName, this.types.TEXT)
    }

    boolean(collumnName) {
        return this.appendCollumn(collumnName, this.types.BOOLEAN)
    }

    float(collumnName) {
        return this.appendCollumn(collumnName, this.types.FLOAT)
    }

    numeric(collumnName) {
        return this.appendCollumn(collumnName, this.types.NUMERIC)
    }

    date(collumnName) {
        return this.appendCollumn(collumnName, this.types.DATETIME)
    }

    dateTime(collumnName) {
        return this.appendCollumn(collumnName, this.types.DATE)
    }

    json(collumnName) {
        return this.appendCollumn(collumnName, this.types.JSON)
    }

    get primaryKey() {
        return [...this.collumns].find((collumn) => collumn.isPrimary)
    }

    get collumnsNames() {
        return [...this.collumns].map((collumn) => collumn.name)
    }

}