import BaseModel from '../orm'
import * as SQLite from 'expo-sqlite'

export default class User extends BaseModel {
    constructor(props) {
        super(props)
    }

    get database() {
        return async () => SQLite.openDatabase('database1.db')
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
        table.integer('role_id')
        table.json('extra_info')
        table.timestamps()
        table.foreign('role_id').references('id').on('roles')
        return table
    }
}