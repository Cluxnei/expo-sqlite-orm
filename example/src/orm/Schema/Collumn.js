import {needQuotationMarksTypes, types} from "./types";

export default class Column {
    constructor(name, type) {
        this.name = name
        this.type = type
        this.isNull = false
        this.isPrimary = false
        this.isAutoIncrement = false
        this.isUnique = false
        this.isUseCurrent = false
        this.defaultValue = undefined
        this.isTimestampcolumn = false
    }

    nullAble() {
        this.isNull = true
        return this
    }

    primaryKey() {
        this.isPrimary = true
        return this
    }

    autoIncrement() {
        this.isAutoIncrement = true
        return this
    }

    unique() {
        this.isUnique = true
        return this
    }

    default(value) {
        this.defaultValue = value
        return this
    }

    useCurrent() {
        this.isUseCurrent = true
        return this
    }

    timestampColumn() {
        this.isTimestampcolumn = true
        return this
    }

    needQuotationMarks() {
        return this.type in needQuotationMarksTypes
    }

    isBoolean() {
        return this.type === types.BOOLEAN
    }

    get toCreateTable() {
        const parts = [this.name, this.type, this.isNull ? 'NULL' : 'NOT NULL']
        this.isPrimary && parts.push('PRIMARY KEY')
        this.isAutoIncrement && parts.push('AUTOINCREMENT')
        this.isUnique && parts.push('UNIQUE')
        if (this.isTimestampcolumn && this.isUseCurrent) {
            this.defaultValue = 'CURRENT_TIMESTAMP'
        }
        if (typeof this.defaultValue !== 'undefined') {
            parts.push(`DEFAULT ${this.needQuotationMarks() ? `'${this.defaultValue}'` : this.defaultValue}`)
        }
        return parts.join(' ')
    }

}