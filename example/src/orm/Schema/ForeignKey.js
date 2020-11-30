export default class ForeignKey {
    constructor(columnName, referencesColumn, referencesTable) {
        this.columnName = columnName
        this.referencesColumn = referencesColumn
        this.referencesTable = referencesTable
    }

    references(referencesColumn = 'id') {
        this.referencesColumn = referencesColumn
        return this
    }

    on(referencesTable) {
        this.referencesTable = referencesTable
        return this
    }

    get toCreateTable() {
        return `FOREIGN KEY (${this.columnName}) REFERENCES ${this.referencesTable} (${this.referencesColumn})`
    }

}