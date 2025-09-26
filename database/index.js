const { Pool } = require("pg")
require("dotenv").config()

let pool

if (process.env.NODE_ENV === "development") {
    // Initialize pool with SSL config for local development
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })
    
    // Check if the original 'pool.query' function is available
    if (pool.query) {
        // Keep a reference to the original query function
        const originalQuery = pool.query
        
        // Overwrite the pool's query method with your custom wrapper
        pool.query = async function (text, params) {
            try {
                const res = await originalQuery.call(pool, text, params) // Use .call to maintain context
                console.log("executed query", { text })
                return res
            } catch (error) {
                console.error("error in query", { text })
                throw error
            }
        }
    }

} else {
    // Initialize pool for production (no SSL object needed)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    })
}

// ALWAYS EXPORT THE 'pool' INSTANCE REGARDLESS OF ENVIRONMENT
module.exports = pool