import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'upgrap',
    port: 5432
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