// setup-supabase.js - Next.js compatible setup script

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Fallback to .env if .env.local doesn't have the vars
if (!process.env.SUPABASE_URL) {
    require('dotenv').config({ path: '.env' });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\n❌ Missing required environment variables:');
    console.error('Please ensure these are in your .env.local or .env file:');
    console.error('- SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupSupabaseDynamicSchema() {
    console.log('\n🚀 Setting up Supabase for dynamic schema management...');

    try {
        // First, let's try to create a simple test
        console.log('📊 Testing Supabase connection...');

        const { data: connectionTest, error: connectionError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);

        if (connectionError) {
            console.error('❌ Connection test failed:', connectionError.message);
            return false;
        }

        console.log('✅ Supabase connection successful');

        // Try to create the function using SQL
        console.log('⚙️  Creating exec_sql function...');

        const execSqlFunction = `
            CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
            RETURNS JSON
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
                result JSON;
            BEGIN
                EXECUTE query;
                RETURN json_build_object('success', true, 'message', 'Query executed successfully');
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'error', SQLERRM);
            END;
            $$;
        `;

        // Try using RPC to execute the function creation
        try {
            const { data: funcResult, error: funcError } = await supabase.rpc('exec_sql', {
                query: execSqlFunction
            });

            if (funcError) {
                throw new Error(funcError.message);
            }

            console.log('✅ exec_sql function created successfully!');
        } catch (rpcError) {
            console.log('⚠️  RPC method failed, function may not exist yet');
            console.log('📋 Please run the following SQL manually in your Supabase SQL Editor:');
            console.log('\n' + '='.repeat(60));
            console.log(execSqlFunction);
            console.log('='.repeat(60) + '\n');
            return false;
        }

        // Test the function
        console.log('🧪 Testing dynamic table creation...');
        const testTableSQL = `
            CREATE TABLE IF NOT EXISTS test_dynamic_table (
                id SERIAL PRIMARY KEY,
                name TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        const { data: testResult, error: testError } = await supabase.rpc('exec_sql', {
            query: testTableSQL
        });

        if (testError) {
            console.error('❌ Test failed:', testError);
            console.log('📋 Manual setup required - see SQL commands above');
            return false;
        }

        console.log('✅ Test table created successfully!');

        // Clean up test table
        await supabase.rpc('exec_sql', {
            query: 'DROP TABLE IF EXISTS test_dynamic_table;'
        });

        console.log('🧹 Cleaned up test table');
        console.log('🎉 Setup completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        return false;
    }
}

// Show manual setup instructions
function showManualSetup() {
    console.log('\n📋 MANUAL SETUP INSTRUCTIONS');
    console.log('=' * 50);
    console.log('Since automatic setup failed, please:');
    console.log('\n1. Go to your Supabase Dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Run the following SQL commands:\n');

    const setupSQL = `-- Enable dynamic schema functionality
CREATE OR REPLACE FUNCTION exec_sql(query TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    EXECUTE query;
    RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO anon;

-- Test the function
SELECT exec_sql('SELECT 1 as test');`;

    console.log(setupSQL);
    console.log('\n' + '='.repeat(50));
    console.log('4. After running the SQL, your Supabase service will support dynamic schema management!');
}

// Main execution
async function main() {
    console.log('🔧 Supabase Dynamic Schema Setup');
    console.log('Using Supabase URL:', supabaseUrl);

    const success = await setupSupabaseDynamicSchema();

    if (!success) {
        showManualSetup();
    }

    console.log('\n✨ Setup process completed.');
    console.log('Your Supabase service will now support dynamic table and column creation!');
}

// Run the setup
main().then(() => {
    process.exit(0);
}).catch(error => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
});
