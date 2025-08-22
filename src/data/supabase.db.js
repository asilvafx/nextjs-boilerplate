import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseService {

    // Get multiple items by a specific key-value pair
    async getItemsByKeyValue(key, value, table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(key, value);

            if (error) {
                console.error('Error fetching items:', error);
                return null;
            }

            return data && data.length > 0 ? data : null;
        } catch (error) {
            console.error('Error in getItemsByKeyValue:', error);
            return null;
        }
    }

    // Get a single item by a specific key-value pair
    async readBy(key, value, table) {
        try {
            console.log(`[DEBUG] readBy - Table: ${table}, Key: ${key}, Value: ${value}`);

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(key, value)
                .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no rows found

            if (error) {
                console.error(`[ERROR] Supabase readBy error for table ${table}:`, {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    searchKey: key,
                    searchValue: value
                });

                // Provide more specific error information
                if (error.code === '42P01') {
                    throw new Error(`Table "${table}" does not exist. Please create it in Supabase Dashboard first.`);
                } else if (error.code === '42703') {
                    throw new Error(`Column "${key}" doesn't exist in table "${table}". Check your table structure.`);
                } else if (error.message.includes('row-level security')) {
                    throw new Error(`Permission denied due to RLS policy. Please check your Row Level Security settings for table "${table}".`);
                }

                return null;
            }

            if (data) {
                console.log(`[DEBUG] Found record:`, data);
            } else {
                console.log(`[DEBUG] No record found for ${key}=${value} in table ${table}`);
            }

            return data;
        } catch (error) {
            console.error(`[ERROR] Error in readBy method for table ${table}:`, error);
            return null;
        }
    }

    // Get the ID of an item by a specific key-value pair
    async getItemKey(key, value, table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('id')
                .eq(key, value)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                console.error('Error fetching item key:', error);
                return null;
            }

            return data ? data.id : null;
        } catch (error) {
            console.error('Error in getItemKey:', error);
            return null;
        }
    }

    // Get an item by ID
    async read(id, table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                console.error('Error fetching item:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in read:', error);
            return null;
        }
    }

    // Read all items from a table
    async readAll(table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*');

            if (error) {
                console.error('Error fetching all items:', error);
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
            console.error('Error in readAll:', error);
            return {};
        }
    }

    // Create a new item
    async create(data, table) {
        try {
            console.log(`[DEBUG] Creating record in table: ${table}`);
            console.log(`[DEBUG] Data to insert:`, JSON.stringify(data, null, 2));

            const { data: result, error } = await supabase
                .from(table)
                .insert([data])
                .select()
                .single();

            if (error) {
                console.error(`[ERROR] Supabase create error for table ${table}:`, {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    data: data
                });

                // Provide more specific error information
                if (error.code === '42P01') {
                    throw new Error(`Table "${table}" does not exist. Please create it in Supabase Dashboard first.`);
                } else if (error.code === '42703') {
                    throw new Error(`Column doesn't exist: ${error.message}. Check your table structure.`);
                } else if (error.code === '23505') {
                    throw new Error(`Duplicate key violation: ${error.message}`);
                } else if (error.message.includes('row-level security')) {
                    throw new Error(`Permission denied due to RLS policy. Please check your Row Level Security settings for table "${table}".`);
                }

                throw error;
            }

            console.log(`[DEBUG] Successfully created record with ID: ${result.id}`);
            return { key: result.id, ref: result };

        } catch (error) {
            console.error(`[ERROR] Error in create method for table ${table}:`, error);
            throw error;
        }
    }

    // Update an existing item
    async update(id, updateData, table) {
        try {
            const { data, error } = await supabase
                .from(table)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating item:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    // Delete an item by ID
    async delete(id, table) {
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting item:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }

    // Delete all items from a table
    async deleteAll(table) {
        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', 0); // Delete all records (since id is never 0 in auto-increment)

            if (error) {
                console.error('Error deleting all items:', error);
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteAll:', error);
            throw error;
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
                console.error('Error uploading file:', error);
                throw error;
            }

            // Get the public URL for the uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(path);

            return publicUrl;
        } catch (error) {
            console.error('Error in upload:', error);
            throw error;
        }
    }

    // Additional utility method for raw SQL queries if needed
    async executeQuery(query, params = []) {
        try {
            const { data, error } = await supabase.rpc('execute_sql', {
                query: query,
                params: params
            });

            if (error) {
                console.error('Error executing query:', error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in executeQuery:', error);
            throw error;
        }
    }
}

export default new SupabaseService();
