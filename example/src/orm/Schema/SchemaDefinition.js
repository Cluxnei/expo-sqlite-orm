import Column from './Collumn'
import {types} from './types';
import ForeignKey from "./ForeignKey";

export default class SchemaDefinition {
    constructor() {
        this.columns = new Set()
        this.types = types
        this.foreignKeys = new Set()
    }

    appendColumn(name, type) {
        const column = new Column(name, type)
        this.columns.add(column)
        return column
    }

    appendForeignKey(columnName) {
        const foreignKey = new ForeignKey(columnName)
        this.foreignKeys.add(foreignKey)
        return foreignKey
    }

    // foreign keys

    foreign(columnName) {
        if (this.findColumnByName(columnName)) {
            return this.appendForeignKey(columnName)
        }
        throw new Error('Can\'t add foreign key in undefined column')
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
        this.dateTime(createdAtColumnName).timestampColumn().useCurrent()
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
        return this.appendColumn(columnName, this.types.DATE)
    }

    dateTime(columnName) {
        return this.appendColumn(columnName, this.types.DATETIME)
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

    get requiredColumns() {
        return [...this.columns].filter((columns) => !columns.isNull)
    }

    get requiredColumnsNames() {
        return this.requiredColumns.map((column) => column.name)
    }

    findColumnByName(name) {
        return [...this.columns].find((column) => column.name === name)
    }

    get toCreateTableBody() {
        const columns = [...this.columns].map((column) => column.toCreateTable).join(',')
        const foreignKeys = [...this.foreignKeys].map((foreignKey) => foreignKey.toCreateTable).join(',')
        return this.foreignKeys.size > 0 ? `${columns},${foreignKeys}` : columns
    }

}