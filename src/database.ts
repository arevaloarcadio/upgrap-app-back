import { Pool } from 'pg';

export const pool = new Pool({
    user: 'doadmin',
    host: 'db-postgresql-fra1-56864-do-user-9839254-0.b.db.ondigitalocean.com',
    password: 'BdmwHF4RViwISXjW',
    database: 'defaultdb',
    port: 25060,
    ssl : true
});
//WrQv%UO-0]i_ clave de usuario de cpanel
// export const pool = new Pool({
//     user: 'upgrlgeq_admin',
//     host: 'localhost',
//     password: 'Theone23$%',
//     database: 'upgrlgeq_api',
//     port: 5432
// });


// export const pool = new Pool({
//     user: 'sanvlwwo_pp',
//     host: 'localhost',
//     password: 'Theone23$%',
//     database: 'sanvlwwo_prueba',
//     port: 5432
// });