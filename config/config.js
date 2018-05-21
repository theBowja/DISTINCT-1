var config = {};

config.dbCredentials = {};

//config.dbCredentials.dbName = 'identity_db';
//config.dbCredentials.port = 443;


config.secret = 'certifiednoideawhatimdoing';


config.db = {};
config.db.hostname = process.env.RDS_HOSTNAME || 'localhost';
config.db.username = process.env.RDS_USERNAME || 'meme';
config.db.password = process.env.RDS_PASSWORD || 'mariomario';
config.db.port 	   = process.env.RDS_PORT     || 3306;
config.db.dbname   = process.env.RDS_DB_NAME  || 'distincttest';


module.exports = config;