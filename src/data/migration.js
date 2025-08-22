// migration.js - Advanced Migration Utilities
import fs from 'fs/promises';
import path from 'path';

class Migration {

    // Data transformation templates for common provider conversions
    static transformations = {
        // Firebase to Supabase transformations
        firebaseToSupabase: {
            // Remove Firebase-specific metadata
            removeFirebaseMetadata: (data, key, table) => {
                const { '.key': firebaseKey, '.priority': priority, ...cleanData } = data;
                return cleanData;
            },

            // Convert Firebase timestamps to ISO strings
            convertTimestamps: (data, key, table) => {
                const converted = { ...data };
                for (const [field, value] of Object.entries(converted)) {
                    if (value && typeof value === 'object' && value.seconds && value.nanoseconds) {
                        // Firebase Timestamp object
                        converted[field] = new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
                    } else if (field.includes('_at') || field.includes('Time') || field.includes('Date')) {
                        // Common timestamp field patterns
                        if (typeof value === 'number' && value > 1000000000000) {
                            converted[field] = new Date(value).toISOString();
                        }
                    }
                }
                return converted;
            },

            // Add created_at and updated_at for Supabase
            addTimestamps: (data, key, table) => {
                const now = new Date().toISOString();
                return {
                    ...data,
                    created_at: data.created_at || data.createdAt || now,
                    updated_at: data.updated_at || data.updatedAt || now
                };
            }
        },

        // Supabase to Firebase transformations
        supabaseToFirebase: {
            // Remove Supabase-specific fields
            removeSupabaseMetadata: (data, key, table) => {
                const { id, created_at, updated_at, ...cleanData } = data;
                return cleanData;
            },

            // Convert ISO strings back to Firebase timestamps
            convertToFirebaseTimestamps: (data, key, table) => {
                const converted = { ...data };
                for (const [field, value] of Object.entries(converted)) {
                    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                        // ISO string pattern
                        const date = new Date(value);
                        converted[field] = date.getTime(); // Firebase typically uses milliseconds
                    }
                }
                return converted;
            }
        },

        // Generic transformations
        generic: {
            // Sanitize field names (remove special characters)
            sanitizeFieldNames: (data, key, table) => {
                const sanitized = {};
                for (const [field, value] of Object.entries(data)) {
                    const cleanField = field.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
                    sanitized[cleanField] = value;
                }
                return sanitized;
            },

            // Validate required fields
            validateRequiredFields: (requiredFields) => (data, key, table) => {
                for (const field of requiredFields) {
                    if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
                        throw new Error(`Required field '${field}' is missing or null`);
                    }
                }
                return data;
            },

            // Add default values for missing fields
            addDefaults: (defaults) => (data, key, table) => {
                return { ...defaults, ...data };
            }
        }
    };

    // Combine multiple transformations
    static combineTransformations(...transformations) {
        return async (data, key, table, fromProvider, toProvider) => {
            let result = data;
            for (const transform of transformations) {
                if (typeof transform === 'function') {
                    result = await transform(result, key, table, fromProvider, toProvider);
                }
            }
            return result;
        };
    }

    // Get recommended transformation chain
    static getRecommendedTransformation(fromProvider, toProvider) {
        const key = `${fromProvider}To${toProvider.charAt(0).toUpperCase() + toProvider.slice(1)}`;
        const transformationSet = this.transformations[key];

        if (!transformationSet) {
            console.warn(`No specific transformation found for ${fromProvider} -> ${toProvider}`);
            return null;
        }

        // Return combined transformation for common scenarios
        return this.combineTransformations(
            ...Object.values(transformationSet)
        );
    }

    // Schema validation
    static async validateSchema(data, schema) {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];

            if (rules.required && (value === undefined || value === null)) {
                errors.push(`Field '${field}' is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                if (rules.type && typeof value !== rules.type) {
                    errors.push(`Field '${field}' must be of type ${rules.type}, got ${typeof value}`);
                }

                if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                    errors.push(`Field '${field}' exceeds maximum length of ${rules.maxLength}`);
                }

                if (rules.pattern && !rules.pattern.test(value)) {
                    errors.push(`Field '${field}' does not match required pattern`);
                }

                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    // Export migration results to file
    static async exportResults(results, filename = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportFilename = filename || `migration-results-${timestamp}.json`;

        try {
            await fs.writeFile(exportFilename, JSON.stringify(results, null, 2));
            console.log(`Migration results exported to: ${exportFilename}`);
            return exportFilename;
        } catch (error) {
            console.error('Failed to export migration results:', error);
            throw error;
        }
    }

    // Import migration results from file
    static async importResults(filename) {
        try {
            const data = await fs.readFile(filename, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to import migration results:', error);
            throw error;
        }
    }

    // Generate migration report
    static generateReport(results) {
        const { summary, tables } = results;

        let report = `
# Migration Report
**Date:** ${results.startTime}
**Duration:** ${results.duration}ms
**From:** ${results.fromProvider} → **To:** ${results.toProvider}

## Summary
- **Tables:** ${summary.successfulTables}/${summary.totalTables} successful
- **Records:** ${summary.migratedRecords}/${summary.totalRecords} migrated
- **Success Rate:** ${((summary.migratedRecords / summary.totalRecords) * 100).toFixed(2)}%

`;

        if (summary.errors.length > 0) {
            report += `## Global Errors\n`;
            summary.errors.forEach(error => {
                report += `- ${error}\n`;
            });
            report += '\n';
        }

        report += `## Table Details\n`;
        Object.entries(tables).forEach(([tableName, tableResult]) => {
            const successRate = tableResult.totalRecords > 0
                ? ((tableResult.migratedRecords / tableResult.totalRecords) * 100).toFixed(2)
                : '0';

            report += `### ${tableName}\n`;
            report += `- **Status:** ${tableResult.status}\n`;
            report += `- **Records:** ${tableResult.migratedRecords}/${tableResult.totalRecords} (${successRate}%)\n`;
            report += `- **Duration:** ${tableResult.startTime} → ${tableResult.endTime}\n`;

            if (tableResult.errors.length > 0) {
                report += `- **Errors:** ${tableResult.errors.length}\n`;
                tableResult.errors.slice(0, 3).forEach(error => {
                    report += `  - ${error.error || error}\n`;
                });
                if (tableResult.errors.length > 3) {
                    report += `  - ... and ${tableResult.errors.length - 3} more\n`;
                }
            }
            report += '\n';
        });

        return report;
    }

    // Save report to file
    static async saveReport(results, filename = null) {
        const report = this.generateReport(results);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFilename = filename || `migration-report-${timestamp}.md`;

        try {
            await fs.writeFile(reportFilename, report);
            console.log(`Migration report saved to: ${reportFilename}`);
            return reportFilename;
        } catch (error) {
            console.error('Failed to save migration report:', error);
            throw error;
        }
    }

    // Compare two databases for consistency
    static async compareData(dbService, provider1, provider2, tables) {
        const originalProvider = dbService.getProvider();
        const differences = {};

        try {
            for (const table of tables) {
                console.log(`Comparing table: ${table}`);

                // Get data from both providers
                dbService.switchProvider(provider1);
                const data1 = await dbService.readAll(table);

                dbService.switchProvider(provider2);
                const data2 = await dbService.readAll(table);

                // Compare
                const keys1 = new Set(Object.keys(data1));
                const keys2 = new Set(Object.keys(data2));

                const onlyIn1 = [...keys1].filter(k => !keys2.has(k));
                const onlyIn2 = [...keys2].filter(k => !keys1.has(k));
                const common = [...keys1].filter(k => keys2.has(k));

                const contentDifferences = [];
                for (const key of common) {
                    if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) {
                        contentDifferences.push({
                            key,
                            [provider1]: data1[key],
                            [provider2]: data2[key]
                        });
                    }
                }

                differences[table] = {
                    total1: Object.keys(data1).length,
                    total2: Object.keys(data2).length,
                    onlyIn1: onlyIn1.length,
                    onlyIn2: onlyIn2.length,
                    common: common.length,
                    contentDifferences: contentDifferences.length,
                    details: {
                        onlyIn1,
                        onlyIn2,
                        contentDifferences: contentDifferences.slice(0, 10) // Limit for readability
                    }
                };
            }
        } finally {
            dbService.switchProvider(originalProvider);
        }

        return differences;
    }

    // Rollback migration (reverse migration)
    static async rollbackMigration(dbService, migrationResults, options = {}) {
        const { deleteTargetData = false, restoreSourceData = false } = options;

        console.log('Starting migration rollback...');

        const rollbackResults = {
            startTime: new Date().toISOString(),
            originalMigration: {
                from: migrationResults.fromProvider,
                to: migrationResults.toProvider,
                timestamp: migrationResults.startTime
            },
            rollbackActions: {},
            summary: { successfulTables: 0, failedTables: 0 }
        };

        const originalProvider = dbService.getProvider();

        try {
            for (const [tableName, tableResult] of Object.entries(migrationResults.tables)) {
                if (tableResult.status !== 'success' && tableResult.status !== 'partial-success') {
                    continue; // Skip tables that weren't successfully migrated
                }

                console.log(`Rolling back table: ${tableName}`);
                rollbackResults.rollbackActions[tableName] = {
                    startTime: new Date().toISOString(),
                    actions: []
                };

                try {
                    // Delete migrated data from target
                    if (deleteTargetData) {
                        dbService.switchProvider(migrationResults.toProvider);

                        // Delete records that were successfully migrated
                        const successfulRecords = tableResult.records.filter(r => r.status === 'success');
                        let deletedCount = 0;

                        for (const record of successfulRecords) {
                            try {
                                await dbService.delete(record.newKey, tableName);
                                deletedCount++;
                            } catch (error) {
                                console.warn(`Failed to delete record ${record.newKey}:`, error.message);
                            }
                        }

                        rollbackResults.rollbackActions[tableName].actions.push({
                            type: 'delete_target_data',
                            recordsDeleted: deletedCount,
                            totalRecords: successfulRecords.length
                        });
                    }

                    // Restore source data (if it was deleted during migration)
                    if (restoreSourceData) {
                        dbService.switchProvider(migrationResults.fromProvider);

                        const restoredCount = 0;
                        // This would require the original migration to have backed up deleted source data
                        // For now, we'll just log that this feature needs source backup data

                        rollbackResults.rollbackActions[tableName].actions.push({
                            type: 'restore_source_data',
                            status: 'not_implemented',
                            message: 'Source data restoration requires backup data from original migration'
                        });
                    }

                    rollbackResults.rollbackActions[tableName].status = 'success';
                    rollbackResults.rollbackActions[tableName].endTime = new Date().toISOString();
                    rollbackResults.summary.successfulTables++;

                } catch (error) {
                    rollbackResults.rollbackActions[tableName].status = 'failed';
                    rollbackResults.rollbackActions[tableName].error = error.message;
                    rollbackResults.rollbackActions[tableName].endTime = new Date().toISOString();
                    rollbackResults.summary.failedTables++;
                    console.error(`Rollback failed for table ${tableName}:`, error);
                }
            }

        } finally {
            dbService.switchProvider(originalProvider);
        }

        rollbackResults.endTime = new Date().toISOString();
        console.log('Migration rollback completed:', rollbackResults.summary);

        return rollbackResults;
    }

    // Preview migration (dry run with detailed analysis)
    static async previewMigration(dbService, fromProvider, toProvider, tables, options = {}) {
        const { sampleSize = 5, checkSchema = true } = options;

        console.log(`Generating migration preview from ${fromProvider} to ${toProvider}...`);

        const originalProvider = dbService.getProvider();
        const preview = {
            fromProvider,
            toProvider,
            timestamp: new Date().toISOString(),
            tables: {},
            summary: {
                totalTables: tables.length,
                totalEstimatedRecords: 0,
                estimatedDataSize: 0,
                warnings: [],
                recommendations: []
            }
        };

        try {
            dbService.switchProvider(fromProvider);

            for (const table of tables) {
                console.log(`Analyzing table: ${table}`);

                const tablePreview = {
                    tableName: table,
                    recordCount: 0,
                    estimatedSize: 0,
                    sampleRecords: [],
                    fieldAnalysis: {},
                    warnings: [],
                    recommendations: []
                };

                try {
                    const allData = await dbService.readAll(table);
                    const entries = Object.entries(allData);

                    tablePreview.recordCount = entries.length;
                    preview.summary.totalEstimatedRecords += entries.length;

                    if (entries.length === 0) {
                        tablePreview.warnings.push('Table is empty');
                        preview.tables[table] = tablePreview;
                        continue;
                    }

                    // Sample records for analysis
                    const sampleCount = Math.min(sampleSize, entries.length);
                    const sampleIndices = new Set();
                    while (sampleIndices.size < sampleCount) {
                        sampleIndices.add(Math.floor(Math.random() * entries.length));
                    }

                    const sampleEntries = [...sampleIndices].map(i => entries[i]);
                    tablePreview.sampleRecords = sampleEntries.slice(0, 3).map(([key, data]) => ({
                        key,
                        data: JSON.stringify(data).substring(0, 200) + '...'
                    }));

                    // Analyze fields across all records
                    const fieldStats = {};
                    let totalDataSize = 0;

                    for (const [key, record] of entries) {
                        const recordSize = JSON.stringify(record).length;
                        totalDataSize += recordSize;

                        for (const [field, value] of Object.entries(record)) {
                            if (!fieldStats[field]) {
                                fieldStats[field] = {
                                    count: 0,
                                    types: new Set(),
                                    nullCount: 0,
                                    maxLength: 0,
                                    examples: []
                                };
                            }

                            fieldStats[field].count++;

                            if (value === null || value === undefined) {
                                fieldStats[field].nullCount++;
                            } else {
                                fieldStats[field].types.add(typeof value);
                                if (typeof value === 'string') {
                                    fieldStats[field].maxLength = Math.max(
                                        fieldStats[field].maxLength,
                                        value.length
                                    );
                                }
                                if (fieldStats[field].examples.length < 3) {
                                    fieldStats[field].examples.push(value);
                                }
                            }
                        }
                    }

                    // Convert field stats for JSON serialization
                    tablePreview.fieldAnalysis = Object.entries(fieldStats).reduce((acc, [field, stats]) => {
                        acc[field] = {
                            ...stats,
                            types: [...stats.types],
                            presence: ((stats.count / entries.length) * 100).toFixed(1) + '%',
                            nullPercentage: ((stats.nullCount / stats.count) * 100).toFixed(1) + '%'
                        };
                        return acc;
                    }, {});

                    tablePreview.estimatedSize = totalDataSize;
                    preview.summary.estimatedDataSize += totalDataSize;

                    // Generate warnings and recommendations
                    for (const [field, analysis] of Object.entries(tablePreview.fieldAnalysis)) {
                        if (analysis.types.length > 1) {
                            tablePreview.warnings.push(`Field '${field}' has mixed types: ${analysis.types.join(', ')}`);
                        }

                        if (parseFloat(analysis.nullPercentage) > 50) {
                            tablePreview.warnings.push(`Field '${field}' is null in ${analysis.nullPercentage} of records`);
                        }

                        if (analysis.maxLength > 1000 && toProvider === 'supabase') {
                            tablePreview.recommendations.push(`Consider using TEXT type for field '${field}' (max length: ${analysis.maxLength})`);
                        }
                    }

                    // Provider-specific recommendations
                    if (fromProvider === 'firebase' && toProvider === 'supabase') {
                        tablePreview.recommendations.push('Consider adding created_at and updated_at timestamps');
                        tablePreview.recommendations.push('Review field names for SQL compatibility');
                    }

                } catch (error) {
                    tablePreview.warnings.push(`Failed to analyze table: ${error.message}`);
                }

                preview.tables[table] = tablePreview;
            }

            // Global recommendations
            const totalSizeMB = preview.summary.estimatedDataSize / (1024 * 1024);
            if (totalSizeMB > 100) {
                preview.summary.recommendations.push(`Large dataset (${totalSizeMB.toFixed(2)}MB) - consider batch processing`);
            }

            if (preview.summary.totalEstimatedRecords > 10000) {
                preview.summary.recommendations.push('Large number of records - enable progress monitoring');
            }

        } finally {
            dbService.switchProvider(originalProvider);
        }

        return preview;
    }
}

export default Migration;
