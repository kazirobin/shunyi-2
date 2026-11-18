/** Server-only database configuration. Credentials must be supplied through environment variables. */
export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://shunyigarments_db_user:j7WZbhz6JC4KOodP@ac-ww37g9l-shard-00-00.d55rxhw.mongodb.net:27017,ac-ww37g9l-shard-00-01.d55rxhw.mongodb.net:27017,ac-ww37g9l-shard-00-02.d55rxhw.mongodb.net:27017/shunyigarments?ssl=true&replicaSet=atlas-9v3tbn-shard-0&authSource=admin&retryWrites=true&w=majority";
export const MONGODB_DATABASE = process.env.MONGODB_DATABASE ?? "shunyigarments_db_user";
