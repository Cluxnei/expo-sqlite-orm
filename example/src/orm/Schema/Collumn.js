export default class Collumn {
    constructor(name, type) {
        this.name = name
        this.type = type
        this.isNull = false
        this.isPrimary = false
        this.isAutoIncrement = false
        this.isUnique = false
        this.isUseCurrent = false
        this.defaultValue = undefined
        this.isTimestampCollumn = false
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

    timestampCollumn() {
        this.isTimestampCollumn = true
        return this
    }
}