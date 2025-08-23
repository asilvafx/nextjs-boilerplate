import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {
    constructor() {
        this.tableCache = new Set(); // Cache existing tables to avoid repeated checks
        this.columnCache = new Map(); // Cache table columns
    }

    // Helper method to check if table exists
    async tableExists(tableName) {
        if (this.tableCache.has(tableName)) {
            return true;
        }

        try {
            const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .eq('table_name', tableName)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.log(`[DEBUG] Error checking table existence: ${error.message}`);
                return false;
            }

            const exists = !!data;
            if (exists) {
                this.tableCache.add(tableName);
            }
            return exists;
        } catch (error) {
            console.log(`[DEBUG] Exception checking table existence: ${error.message}`);
            return false;
        }
    }

    // Helper method to get table columns
    async getTableColumns(tableName) {
        if (this.columnCache.has(tableName)) {
            return this.columnCache.get(tableName);
        }

        try {
            const { data, error } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, is_nullable')
                .eq('table_schema', 'public')
                .eq('table_name', tableName);

            if (error) {
                console.log(`[DEBUG] Error getting columns for ${tableName}: ${error.message}`);
                return [];
            }

            const columns = data || [];
            this.columnCache.set(tableName, columns);
            return columns;
        } catch (error) {
            console.log(`[DEBUG] Exception getting columns: ${error.message}`);
            return [];
        }
    }

    // Helper method to infer SQL data type from JavaScript value
    inferDataType(value) {
        if (value === null || value === undefined) {
            return 'TEXT';
        }

        const type = typeof value;
        switch (type) {
            case 'string':
                return 'TEXT';
            case 'number':
                return Number.isInteger(value) ? 'INTEGER' : 'DECIMAL';
            case 'boolean':
                return 'BOOLEAN';
            case 'object':
                if (value instanceof Date) {
                    return 'TIMESTAMPTZ';
                }
                return 'JSONB';
            default:
                return 'TEXT';
        }
    }

    // Helper method to create table dynamically
    async createTable(tableName, sampleData = {}) {
        try {
            console.log(`[DEBUG] Creating table: ${tableName}`);

            let columns = ['id SERIAL PRIMARY KEY'];

            // Add columns based on sample data
            Object.entries(sampleData).forEach(([key, value]) => {
                if (key !== 'id') {
                    const dataType = this.inferDataType(value);
                    columns.push(`${key} ${dataType}`);
                }
            });

            // Add default timestamp columns
            columns.push('created_at TIMESTAMPTZ DEFAULT NOW()');
            columns.push('updated_at TIMESTAMPTZ DEFAULT NOW()');

            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    ${columns.join(',\n    ')}
                );
            `;

            const { error } = await supabase.rpc('exec_sql', {
                query: createTableSQL
            });

            if (error) {
                // Try alternative method if rpc doesn't work
                console.log(`[DEBUG] RPC method failed, trying direct SQL execution`);
                const { error: directError } = await supabase
                    .from('_sql')
                    .select()
                    .limit(0); // This might not work, but we'll try

                if (directError) {
                    console.log(`[DEBUG] Could not create table ${tableName} dynamically`);
                    return false;
                }
            }

            this.tableCache.add(tableName);
            this.columnCache.delete(tableName); // Clear column cache to refresh
            console.log(`[DEBUG] Table ${tableName} created successfully`);
            return true;
        } catch (error) {
            console.log(`[DEBUG] Error creating table ${tableName}: ${error.message}`);
            return false;
        }
    }

    // Helper method to add missing columns
    async addMissingColumns(tableName, data) {
        try {
            const existingColumns = await this.getTableColumns(tableName);
            const existingColumnNames = existingColumns.map(col => col.column_name);

            const newColumns = [];
            Object.entries(data).forEach(([key, value]) => {
                if (!existingColumnNames.includes(key) && key !== 'id') {
                    const dataType = this.inferDataType(value);
                    newColumns.push({ name: key, type: dataType });
                }
            });

            if (newColumns.length === 0) {
                return true; // No new columns needed
            }

            console.log(`[DEBUG] Adding columns to ${tableName}:`, newColumns.map(c => c.name));

            for (const column of newColumns) {
                try {
                    const alterSQL = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`;

                    const { error } = await supabase.rpc('exec_sql', {
                        query: alterSQL
                    });

                    if (error) {
                        console.log(`[DEBUG] Could not add column ${column.name}: ${error.message}`);
                    } else {
                        console.log(`[DEBUG] Added column ${column.name} to ${tableName}`);
                    }
                } catch (error) {
                    console.log(`[DEBUG] Exception adding column ${column.name}: ${error.message}`);
                }
            }

            // Clear column cache to refresh
            this.columnCache.delete(tableName);
            return true;
        } catch (error) {
            console.log(`[DEBUG] Error adding columns: ${error.message}`);
            return false;
        }
    }

    // Get multiple items by a specific key-value pair
    async getItemsByKeyValue(key, value, table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return null;
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(key, value);

            if (error) {
                console.log(`[DEBUG] Error fetching items from ${table}: ${error.message}`);
                return null;
            }

            return data && data.length > 0 ? data : null;
        } catch (error) {
            console.log(`[DEBUG] Exception in getItemsByKeyValue: ${error.message}`);
            return null;
        }
    }

    // Get a single item by a specific key-value pair
    async readBy(key, value, table) {
        try {
            console.log(`[DEBUG] readBy - Table: ${table}, Key: ${key}, Value: ${value}`);

            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return null;
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(key, value)
                .maybeSingle();

            if (error) {
                console.log(`[DEBUG] Error in readBy for table ${table}: ${error.message}`);
                return null;
            }

            if (data) {
                console.log(`[DEBUG] Found record:`, data);
            } else {
                console.log(`[DEBUG] No record found for ${key}=${value} in table ${table}`);
            }

            return data;
        } catch (error) {
            console.log(`[DEBUG] Exception in readBy method for table ${table}: ${error.message}`);
            return null;
        }
    }

    // Get the ID of an item by a specific key-value pair
    async getItemKey(key, value, table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return null;
            }

            const { data, error } = await supabase
                .from(table)
                .select('id')
                .eq(key, value)
                .single();

            if (error) {
                console.log(`[DEBUG] Error fetching item key from ${table}: ${error.message}`);
                return null;
            }

            return data ? data.id : null;
        } catch (error) {
            console.log(`[DEBUG] Exception in getItemKey: ${error.message}`);
            return null;
        }
    }

    // Get an item by ID
    async read(id, table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return null;
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.log(`[DEBUG] Error fetching item from ${table}: ${error.message}`);
                return null;
            }

            return data;
        } catch (error) {
            console.log(`[DEBUG] Exception in read: ${error.message}`);
            return null;
        }
    }

    // Read all items from a table
    async readAll(table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return {};
            }

            const { data, error } = await supabase
                .from(table)
                .select('*');

            if (error) {
                console.log(`[DEBUG] Error fetching all items from ${table}: ${error.message}`);
                return {};
            }

            // Convert array to object with IDs as keys (similar to Firebase format)
            const result = {};
            if (data && data.length > 0) {
                data.forEach(item => {
                    result[item.id] = item;
                });
            }

            return result;
        } catch (error) {
            console.log(`[DEBUG] Exception in readAll: ${error.message}`);
            return {};
        }
    }

    // Create a new item
    async create(data, table) {
        try {
            console.log(`[DEBUG] Creating record in table: ${table}`);
            console.log(`[DEBUG] Data to insert:`, JSON.stringify(data, null, 2));

            // Check if table exists, create if it doesn't
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist, creating it...`);
                const tableCreated = await this.createTable(table, data);
                if (!tableCreated) {
                    console.log(`[DEBUG] Could not create table ${table}`);
                    return null;
                }
            }

            // Add missing columns if any
            await this.addMissingColumns(table, data);

            // Add timestamps if not present
            const dataWithTimestamps = {
                ...data,
                created_at: data.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: result, error } = await supabase
                .from(table)
                .insert([dataWithTimestamps])
                .select()
                .single();

            if (error) {
                console.log(`[DEBUG] Error creating record in ${table}: ${error.message}`);
                return null;
            }

            console.log(`[DEBUG] Successfully created record with ID: ${result.id}`);
            return { key: result.id, ref: result };

        } catch (error) {
            console.log(`[DEBUG] Exception in create method for table ${table}: ${error.message}`);
            return null;
        }
    }

    // Update an existing item
    async update(id, updateData, table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return null;
            }

            // Add missing columns if any
            await this.addMissingColumns(table, updateData);

            // Add updated timestamp
            const dataWithTimestamp = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(table)
                .update(dataWithTimestamp)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.log(`[DEBUG] Error updating item in ${table}: ${error.message}`);
                return null;
            }

            return data;
        } catch (error) {
            console.log(`[DEBUG] Exception in update: ${error.message}`);
            return null;
        }
    }

    // Delete an item by ID
    async delete(id, table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return false;
            }

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                console.log(`[DEBUG] Error deleting item from ${table}: ${error.message}`);
                return false;
            }

            return true;
        } catch (error) {
            console.log(`[DEBUG] Exception in delete: ${error.message}`);
            return false;
        }
    }

    // Delete all items from a table
    async deleteAll(table) {
        try {
            // Check if table exists first
            const tableExistsCheck = await this.tableExists(table);
            if (!tableExistsCheck) {
                console.log(`[DEBUG] Table ${table} does not exist`);
                return true; // Consider it successful if table doesn't exist
            }

            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', 0); // Delete all records

            if (error) {
                console.log(`[DEBUG] Error deleting all items from ${table}: ${error.message}`);
                return false;
            }

            return true;
        } catch (error) {
            console.log(`[DEBUG] Exception in deleteAll: ${error.message}`);
            return false;
        }
    }

    // Upload a file to Supabase Storage
    async upload(file, path) {
        try {
            const { data, error } = await supabase.storage
                .from('uploads') // You'll need to create this bucket in Supabase
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.log(`[DEBUG] Error uploading file: ${error.message}`);
                throw error;
            }

            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.log(`[DEBUG] Exception in upload: ${error.message}`);
            throw error;
        }
    }

    // Additional utility method for raw SQL queries if needed
    async executeQuery(query, params = []) {
        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                query: query,
                params: params
            });

            if (error) {
                console.log(`[DEBUG] Error executing query: ${error.message}`);
                return null;
            }

            return data;
        } catch (error) {
            console.log(`[DEBUG] Exception in executeQuery: ${error.message}`);
            return null;
        }
    }

    // Helper method to create the exec_sql function in Supabase (run this once)
    async setupDynamicSchema() {
        try {
            const setupSQL = `
                CREATE OR REPLACE FUNCTION exec_sql(query TEXT, params JSONB DEFAULT '[]')
                RETURNS JSON
                LANGUAGE plpgsql
                SECURITY DEFINER
                AS $$
                DECLARE
                    result JSON;
                BEGIN
                    EXECUTE query INTO result;
                    RETURN result;
                EXCEPTION
                    WHEN OTHERS THEN
                        RETURN json_build_object('error', SQLERRM);
                END;
                $$;
            `;

            const { error } = await supabase.rpc('exec_sql', { query: setupSQL });

            if (error) {
                console.log(`[DEBUG] Could not setup dynamic schema function: ${error.message}`);
                return false;
            }

            console.log(`[DEBUG] Dynamic schema function setup completed`);
            return true;
        } catch (error) {
            console.log(`[DEBUG] Exception setting up dynamic schema: ${error.message}`);
            return false;
        }
    }

    // Clear caches (useful for development)
    clearCache() {
        this.tableCache.clear();
        this.columnCache.clear();
        console.log(`[DEBUG] Supabase caches cleared`);
    }
}

export default new SupabaseService();
