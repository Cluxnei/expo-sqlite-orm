# Expo SQLite ORM

It is a simple ORM utility to use with expo sqlite

> Warn: it works only on iOS and Android. Web is not supported ([SEE](https://docs.expo.io/versions/latest/sdk/sqlite/))

## Install

*TODO* `yarn add package-name`

## Creating a model

You need to provide 3 things:

- `database`: Instance of expo SQLite or promise with that instance
- `tableName`: The name of the table
- `schemaDefinition`: The columns for the model and their types
  - Supported options: `nullAble()`, `primaryKey()`,
  `autoIncrement()`, `unique()`, `default(value)`, `useCurrent()`
    ([See schema options](#schema-options))
  - Supported types: `int()`, `string()`, `json()`, `bool()`, `float()`, `numeric()`, `date()`, `dateTime()` 
    ([See schema definition](#schema-definition))

```javascript
import * as SQLite from 'expo-sqlite'
import { BaseModel, types } from 'package-name'

export default class Animal extends BaseModel {
  constructor(obj) {
    super(obj)
  }

  static get database() {
    return async () => SQLite.openDatabase('database.db')
  }

  static get tableName() {
    return 'animals'
  }

  static get schemaDefinition() {
    const table = this.tableDefinition()
    // More information in types table
    table.id() // int auto increment primary key
    table.string('identification_id').unique()
    table.string('name')
    table.string('color').default('none')
    table.text('description').nullAble()
    table.boolean('isBird').default(false)
    table.float('weight').nullAble()
    table.integer('age').nullAble()
    table.timestamps() // created_at and updated_at dateTime columns
    return table
  }
}
```

## Schema definition and data types

### `Abbreviations`

| Method        | Equivalency   |
| ------------- |:-------------:|
| id('column_name')     | integer().primaryKey().autoIncrement() |
| timestamps()     | dateTime('created_at').useCurrent() and dateTime('updated_at').nullAble() |
| | |

### `Schema definition`

| Method        | SQLite type   |
| ------------- |:-------------:|
| id('column_name')     | INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT |
| int('column_name') or integer('column_name')   | INTEGER |
| string('column_name') or text('column_name') | TEXT |
| json('column_name') | TEXT |
| boolean('column_name') or bool('column_name')  | BOOLEAN |
| float('column_name') or double('column_name')   | FLOAT |
| numeric('column_name') | NUMERIC |
| date('column_name') | DATE |
| dateTime('column_name') | DATETIME |
| | |

### `Schema options`

| Method        | Description   |
| ------------- |:-------------:|
| nullAble()     | Allows the field to be null |
| primaryKey()     | Set primary key |
| autoIncrement()     | Set auto increment |
| unique()     | Set unique |
| default(value)     | Set default value |
| useCurrent()     | Only to `date` and `dateTime` columns, use new Date().getTime() on insertion |
| | |

## Database operations

### Drop table

`Animal.dropTable()`

### Create table

`Animal.createTable()`

### Create a record

```javascript
const props = {
  name: 'Bob',
  color: 'Brown',
  age: 2
}

const animal = new Animal(props)
animal.save()
```

or

```javascript
const props = {
  name: 'Bob',
  color: 'Brown',
  age: 2
}

Animal.create(props)
```

or

```javascript
const many = [
    {
        name: 'Bob',
        color: 'Brown',
        age: 2
    },
    {
        name: 'Tor Odin',
        color: 'Black',
        age: 1
    }
]

Animal.create(many)
```

### Find a record

```javascript
const id = 1
Animal.find(id)
```

### Get many

```javascript
Animal.query().whereNotNull('description').get()
Animal.query().where('age', '>', 3).orWhere('age', '=', '2').get()
```

### Update a record

```javascript
const id = 1
const animal = await Animal.find(id)
animal.age = 3
animal.save()
```

or

```javascript
const props = {
  id: 1, // required
  age: 3
}

Animal.update(props)
```

or

```javascript
Animal.query().find(id).update(props)
```
or *to many registers*

```javascript
Animal.query().where('name', '=', 'Bob').orWhere('name', 'like', '%Tor%').update(props)
```

### Destroy a record

```javascript
const id = 1
Animal.destroy(id)
```

or

```javascript
const id = 1
const animal = await Animal.find(id)
animal.destroy()
```

or

```javascript
Animal.query().find(id).destroy()
Animal.query().where('id', '!=', 1).first().destroy()
Animal.query().where('id', '!=', 1).destroy() // Many records
```

### Destroy all records

```javascript
Animal.destroyAll()
Animal.query().destroy() // Also destroys all
```

### Query and **operations**

| Method        | Description or translation  | Implementation |
| ---------------- |:----------------:|:----:|
| query() | Start a query builder | OK |
| where('column', 'operator', 'value') | WHERE column OPERATOR value | OK |
| where((query) => query.where(...)...) | WHERE (column OPERATOR value ...) | OK |
| whereNull('column') | WHERE column IS NULL | OK |
| whereNotNull('column') | WHERE column NOT IS NULL | OK |
| orderBy(...columns) | ORDER BY ...columns ASC | OK |
| orderByDesc(...columns) | ORDER BY ...columns DESC | OK |
| groupBy(...columns) | GROUP BY ...columns | OK |
| limit(count) | LIMIT count | OK |
| count('column') | SELECT COUNT(column) default is id | OK |
| max('column') | SELECT max(column) | |
| min('column') | SELECT min(column) | |
| avg('column') | SELECT avg(column) | |
| select(...columns) or select(['column', ...]) | SELECT ... | OK |
| selectRaw('raw expression') | SELECT raw expression | OK |
| exists() | EXISTS(QUERY ...) | OK |
| notExists() | NOT EXISTS(QUERY ...) | OK |
| distinct('column') | SELECT DISTINCT column | OK |
| orWhere('column', 'operator', 'value') | OR WHERE column OPERATOR value | OK |
| orWhereNull('column', 'operator', 'value') | OR WHERE column OPERATOR value | OK |
| orWhereNull('column', 'operator', 'value') | OR WHERE column OPERATOR value | OK |
| whereIn('column', [...values]) | WHERE column IN(values) | OK |
| orWhereIn('column', [...values]) | OR WHERE column IN(values)  | OK |
| whereNotIn('column', [...values]) | WHERE column NOT IN(values)  | OK |
| orWhereNotIn('column', [...values]) | OR WHERE column NOT IN(values)  | OK |
| whereRaw('expression') | WHERE raw expression | OK |
| orWhereRaw('expression') | OR WHERE raw expression | OK |
| | | |

## How to exec a sql manually?

```javascript
Animal.databaseLayer.executeBulkSql([...sqls], [...params])
Animal.databaseLayer.executeSql(sql, params)
```

## Working examples

### *TODO*

## Authors

- [Kelvin Cluxnei](http://kelvin.cluxnei.com)
- [Luis Guilherme Silva Flórido](http://kelvin.cluxnei.com)

## License

This project is licensed under
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
