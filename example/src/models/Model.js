import BaseModel from './orm'

export default class Model extends BaseModel {
    constructor(props) {
        super(props)
    }

    get database() {
        return async () => null //SQLite.openDatabase('database.db')
    }

    get tableName() {
        return 'users'
    }

    get schemaDefinition() {
        const table = this.tableDefinition()
        table.id()
        table.string('name')
        table.boolean('active').default(false)
        table.float('weight').nullAble()
        table.integer('age').nullAble()
        table.timestamps()
        return table
    }
}