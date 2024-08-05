# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

## Known Issues

- There is no test database created. The tests are going to use the main database, and, very likely, delete all the data inside it. 
- The environment variables should be inside a .env file. Instead, they are kinda scattered all over the place, which makes maintenance a burden
- We should move all of the DB and models layers to a real ORM, like Prisma or TypeORM