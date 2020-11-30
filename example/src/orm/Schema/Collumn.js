import {customTypesCasts, needQuotationMarksTypes, types} from './types';

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
        this.customTypesCasts = customTypesCasts
        this.safeType = this.type in this.customTypesCasts ? this.customTypesCasts[this.type] : this.type
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
        return needQuotationMarksTypes.includes(this.type)
    }

    isBoolean() {
        return this.type === types.BOOLEAN
    }

    isJson() {
        return this.type === types.JSON
    }

    isNumber() {
        return [types.FLOAT, types.INTEGER, types.NUMERIC].includes(this.type)
    }

    get toCreateTable() {
        const parts = [this.name, this.safeType, this.isNull ? 'NULL' : 'NOT NULL']
        this.isPrimary && parts.push('PRIMARY KEY')
        this.isAutoIncrement && parts.push('AUTOINCREMENT')
        this.isUnique && parts.push('UNIQUE')
        if (this.isTimestampcolumn && this.isUseCurrent) {
            this.defaultValue = 'CURRENT_TIMESTAMP'
        }
        if (typeof this.defaultValue !== 'undefined') {
            parts.push(`DEFAULT ${this.castToDatabaseValue(this.defaultValue)}`)
        }
        return parts.join(' ')
    }

    castToDatabaseValue(value) {
        if (this.needQuotationMarks()) {
            return `'${value}'`
        }
        if (this.isBoolean()) {
            return Boolean(value) ? 1 : 0
        }
        if (this.isJson()) {
            return typeof value === 'string' ? value : JSON.stringify(value)
        }
        return value
    }

    castToModelAttribute(value) {
        if (this.isBoolean()) {
            return Boolean(value)
        }
        if (this.isNumber()) {
            return Number(value)
        }
        if (this.isJson()) {
            return typeof value === 'string' ? JSON.parse(value) : value
        }
        return value
    }

}