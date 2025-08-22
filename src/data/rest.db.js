// rest.db.js - Unified Database Service
import FirebaseService from './firebase.db.js';
import SupabaseService from './supabase.db.js';

// Configuration - Set your preferred database here
const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER || 'supabase'; // 'firebase' or 'supabase'

class DBService {
    constructor() {
        this.provider = DATABASE_PROVIDER.toLowerCase();
        this.service = this.provider === 'firebase' ? FirebaseService : SupabaseService;

        console.log(`Database provider initialized: ${this.provider}`);
    }

    // Get the current provider name
    getProvider() {
        return this.provider;
    }

    // Switch provider at runtime (optional)
    switchProvider(newProvider) {
        if (newProvider !== 'firebase' && newProvider !== 'supabase') {
            throw new Error('Invalid provider. Use "firebase" or "supabase"');
        }

        this.provider = newProvider.toLowerCase();
        this.service = this.provider === 'firebase' ? FirebaseService : SupabaseService;

        console.log(`Database provider switched to: ${this.provider}`);
        return this.provider;
    }

    // Unified methods - these will call the appropriate service
    async getItemsByKeyValue(key, value, table) {
        try {
            return await this.service.getItemsByKeyValue(key, value, table);
        } catch (error) {
            console.error(`Error in getItemsByKeyValue (${this.provider}):`, error);
            throw error;
        }
    }

    async readBy(key, value, table) {
        try {
            return await this.service.readBy(key, value, table);
        } catch (error) {
            console.error(`Error in readBy (${this.provider}):`, error);
            throw error;
        }
    }

    async getItemKey(key, value, table) {
        try {
            return await this.service.getItemKey(key, value, table);
        } catch (error) {
            console.error(`Error in getItemKey (${this.provider}):`, error);
            throw error;
        }
    }

    async read(id, table) {
        try {
            return await this.service.read(id, table);
        } catch (error) {
            console.error(`Error in read (${this.provider}):`, error);
            throw error;
        }
    }

    async readAll(table) {
        try {
            return await this.service.readAll(table);
        } catch (error) {
            console.error(`Error in readAll (${this.provider}):`, error);
            throw error;
        }
    }

    async create(data, table) {
        try {
            return await this.service.create(data, table);
        } catch (error) {
            console.error(`Error in create (${this.provider}):`, error);
            throw error;
        }
    }

    async update(id, updateData, table) {
        try {
            return await this.service.update(id, updateData, table);
        } catch (error) {
            console.error(`Error in update (${this.provider}):`, error);
            throw error;
        }
    }

    async delete(id, table) {
        try {
            return await this.service.delete(id, table);
        } catch (error) {
            console.error(`Error in delete (${this.provider}):`, error);
            throw error;
        }
    }

    async deleteAll(table) {
        try {
            return await this.service.deleteAll(table);
        } catch (error) {
            console.error(`Error in deleteAll (${this.provider}):`, error);
            throw error;
        }
    }

    async upload(file, path) {
        try {
            return await this.service.upload(file, path);
        } catch (error) {
            console.error(`Error in upload (${this.provider}):`, error);
            throw error;
        }
    }

    // Provider-specific methods (if needed)
    async executeSupabaseQuery(query, params = []) {
        if (this.provider !== 'supabase') {
            throw new Error('executeSupabaseQuery is only available with Supabase provider');
        }
        return await this.service.executeQuery(query, params);
    }

    // Health check method
    async healthCheck() {
        try {
            // Simple test to verify connection
            const testResult = await this.readAll('test_table');
            return {
                provider: this.provider,
                status: 'connected',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                provider: this.provider,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Migration helper (optional)
    async migrateData(fromProvider, toProvider, tables = []) {
        if (fromProvider === toProvider) {
            throw new Error('Source and destination providers cannot be the same');
        }

        console.log(`Starting migration from ${fromProvider} to ${toProvider}...`);

        // Switch to source provider
        const originalProvider = this.provider;
        this.switchProvider(fromProvider);

        const migrationResults = {};

        for (const table of tables) {
            try {
                console.log(`Migrating table: ${table}`);

                // Read all data from source
                const sourceData = await this.readAll(table);

                // Switch to destination provider
                this.switchProvider(toProvider);

                // Insert data into destination
                const results = [];
                for (const [key, item] of Object.entries(sourceData)) {
                    try {
                        const result = await this.create(item, table);
                        results.push(result);
                    } catch (error) {
                        console.error(`Error migrating item ${key}:`, error);
                        results.push({ error: error.message, originalKey: key });
                    }
                }

                migrationResults[table] = {
                    totalItems: Object.keys(sourceData).length,
                    migratedItems: results.length,
                    results: results
                };

                // Switch back to source for next table
                this.switchProvider(fromProvider);

            } catch (error) {
                console.error(`Error migrating table ${table}:`, error);
                migrationResults[table] = { error: error.message };
            }
        }

        // Restore original provider
        this.switchProvider(originalProvider);

        console.log('Migration completed:', migrationResults);
        return migrationResults;
    }
}

export default new DBService();
