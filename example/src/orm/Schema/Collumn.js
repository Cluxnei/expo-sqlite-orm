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
}