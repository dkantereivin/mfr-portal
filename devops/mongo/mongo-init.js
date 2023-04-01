db.createUser(
    {
        user: process.env.MONGO_DATABASE_USERNAME,
        pwd: process.env.MONGO_DATABASE_PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: process.env.MONGO_DATABASE_NAME
            }
        ]
    }
)