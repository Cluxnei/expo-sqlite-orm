export const types = {
    INTEGER: 'INTEGER',
    FLOAT: 'FLOAT',
    TEXT: 'TEXT',
    NUMERIC: 'NUMERIC',
    DATE: 'DATE',
    DATETIME: 'DATETIME',
    BOOLEAN: 'BOOLEAN',
    JSON: 'JSON'
}

export const needQuotationMarksTypes = [types.TEXT, types.JSON]

export const customTypesCasts = {
    [types.JSON]: types.TEXT,
}