var schema = {};

schema.defs = {};

schema.defs.user = 
`user (
	Id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(40) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password CHAR(60) BINARY NOT NULL,

	UNIQUE (username),
	PRIMARY KEY (id)
)`;

schema.defs.topology = 
`topology (
	Id INT NOT NULL AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	location VARCHAR(63) NOT NULL,

	PRIMARY KEY (id)
)`;

schema.defs.permission = 
`permission (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	role ENUM('owner', 'readonly', 'readwrite') NOT NULL DEFAULT 'readwrite',
	topoid INT NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(id),
	FOREIGN KEY (topoid) REFERENCES topology(id),
	PRIMARY KEY (id)
)`;

module.exports = schema;