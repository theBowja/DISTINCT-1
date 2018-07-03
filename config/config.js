var config = {};

config.dbCredentials = {};

//config.dbCredentials.dbName = 'identity_db';
//config.dbCredentials.port = 443;


config.secret = 'certifiednoideawhatimdoing';


config.db = {};
config.db.hostname 	= process.env.RDS_HOSTNAME || 'localhost'; 
config.db.username 	= process.env.RDS_USERNAME || 'me'; // edit the part after the '||'
config.db.password 	= process.env.RDS_PASSWORD || 'mario';
config.db.port 	   	= process.env.RDS_PORT     || 3306;
config.db.dbname   	= process.env.RDS_DB_NAME  || 'distincttest';

config.filedirectory = process.env.MOUNT_DIRECTORY || './public/uploads';

module.exports = config;