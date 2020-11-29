# Expo SQLite ORM

It is a simple ORM utility to use with expo sqlite

> Warn: it works only on iOS and Android. Web is not supported ([SEE](https://docs.expo.io/versions/latest/sdk/sqlite/))

## Install

*TODO* `yarn add package-name`

## Creating a model

You need to provide 3 things:

- `database`: Instance of expo SQLite or promise with that instance
- `tableName`: The name of the table
- `schemaDefinition`: The columns for the model and their types, the table schema object is injected
  - Supported options: `nullAble()`, `primaryKey()`,
  `autoIncrement()`, `unique()`, `default(value)`, `useCurrent()`

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
    table.timestamps() // created_at and updated_at dateTime collumns
    return table
  }
}
```

## Schema definition and data types

### `Abbreviations`

| Method        | Equivalency   |
| ------------- |:-------------:|
| id('collumn_name')     | integer().primaryKey().autoIncrement() |
| timestamps()     | dateTime('created_at').useCurrent() and dateTime('updated_at').nullAble() |
| | |

### `Schema definition`

| Method        | SQLite type   |
| ------------- |:-------------:|
| id('collumn_name')     | INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT |
| int('collumn_name') or integer('collumn_name')   | INTEGER |
| string('collumn_name') or text('collumn_name') | TEXT |
| json('collumn_name') | TEXT |
| boolean('collumn_name') or bool('collumn_name')  | BOOLEAN |
| float('collumn_name') or double('collumn_name')   | FLOAT |
| numeric('collumn_name') | NUMERIC |
| date('collumn_name') | DATE |
| dateTime('collumn_name') | DATETIME |
| | |

### `Schema options`

| Method        | Description   |
| ------------- |:-------------:|
| nullAble()     | Allows the field to be null |
| primaryKey()     | Set primary key |
| autoIncrement()     | Set auto increment |
| unique()     | Set unique |
| default(value)     | Set default value |
| useCurrent()     | Only to `date` and `dateTime` collumns, use new Date().getTime() on insertion |
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
  id: 1 // required
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
| where('collumn', 'operator', 'value') | WHERE collumn OPERATOR value | |
| whereNull('collumn') | WHERE collumn IS NULL | |
| whereNotNull('collumn') | WHERE collumn NOT IS NULL | |
| orderBy('collumns') | ORDER BY collumn ASC | |
| orderByDesc('collumns') | ORDER BY collumn DESC | |
| limit(count) | LIMIT count | OK |
| count('collumn') | SELECT COUNT(collumn) default is id | |
| max('collumn') | SELECT max(collumn) | |
| min('collumn') | SELECT min(collumn) | |
| avg('collumn') | SELECT avg(collumn) | |
| select(...collumns) or select(['collumn', ...]) | SELECT ... | OK |
| selectRaw('raw expression') | SELECT raw expression | OK |
| exists() | QUERY ... EXISTS | |
| doesntExist() | QUERY ... NOT EXISTS | |
| distinct('collumn') | SELECT DISTINCT collumn | OK |
| groupBy(...collumns) | QUERY ... GROUP BY collumns | |
| orWhere('collumn', 'operator', 'value') | OR WHERE collumn OPERATOR value | |
| whereIn('collumn', [...values]) | WHERE collumn IN(values) | |
| orWhereIn('collumn', [...values]) | OR WHERE collumn IN(values)  | |
| whereNotIn('collumn', [...values]) | WHERE collumn NOT IN(values)  | |
| orWhereNotIn('collumn', [...values]) | OR WHERE collumn NOT IN(values)  | |
| whereRaw('expression') | WHERE raw expression | |
| orWhereRaw('expression') | OR WHERE raw expression | |
| | | |

## How to exec a sql manually?

### *TODO*

## Working examples

### *TODO*

## Authors

- [Kelvin Cluxnei](http://kelvin.cluxnei.com)
- [Luis Guilherme Silva Flórido](http://kelvin.cluxnei.com)

## License

This project is licensed under
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
