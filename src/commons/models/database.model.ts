export interface DatabaseConnection {
    type: 'default' | 'custom';
    connectionString?: string;
    name?: string;
}

export interface TableSchema {
    tableName: string;
    columns: ColumnDefinition[];
}

export interface ColumnDefinition {
    name: string;
    type: string;
    queryBuilderType: 'text' | 'number' | 'date' | 'boolean' | 'select';
    nullable: boolean;
    isPrimaryKey?: boolean;
}
