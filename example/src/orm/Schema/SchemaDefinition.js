import Column from './Collumn'

export default class SchemaDefinition {
    constructor() {
        this.columns = new Set()
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

    appendColumn(name, type) {
        const column = new Column(name, type)
        this.columns.add(column)
        return column
    }

    // Abbreviations

    id() {
        return this.integer('id').primaryKey().autoIncrement()
    }

    int(columnName) {
        return this.integer(columnName)
    }

    double(columnName) {
        return this.float(columnName)
    }

    bool(columnName) {
        return this.boolean(columnName)
    }

    string(columnName) {
        return this.text(columnName)
    }

    timestamps(createdAtColumnName = 'createdAt', updatedAtColumnName = 'updatedAt') {
        this.dateTime(createdAtColumnName).default(new Date().getTime()).timestampColumn()
        this.dateTime(updatedAtColumnName).nullAble().timestampColumn()
    }


    // column types

    integer(columnName) {
        return this.appendColumn(columnName, this.types.INTEGER)
    }

    text(columnName) {
        return this.appendColumn(columnName, this.types.TEXT)
    }

    boolean(columnName) {
        return this.appendColumn(columnName, this.types.BOOLEAN)
    }

    float(columnName) {
        return this.appendColumn(columnName, this.types.FLOAT)
    }

    numeric(columnName) {
        return this.appendColumn(columnName, this.types.NUMERIC)
    }

    date(columnName) {
        return this.appendColumn(columnName, this.types.DATETIME)
    }

    dateTime(columnName) {
        return this.appendColumn(columnName, this.types.DATE)
    }

    json(columnName) {
        return this.appendColumn(columnName, this.types.JSON)
    }

    get primaryKey() {
        return [...this.columns].find((column) => column.isPrimary)
    }

    get columnsNames() {
        return [...this.columns].map((column) => column.name)
    }

}