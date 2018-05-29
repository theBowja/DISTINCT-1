var schema = {};

schema.defs = {};

schema.defs.user = 
`user (
	Id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(40) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password CHAR(60) BINARY NOT NULL,

	UNIQUE (username),
	PRIMARY KEY (Id)
)`;

schema.defs.topology = 
`topology (
	Id INT NOT NULL AUTO_INCREMENT,
	toponame VARCHAR(255) NOT NULL,
	location VARCHAR(63) NOT NULL,

	UNIQUE (location),
	PRIMARY KEY (Id)
)`;

schema.defs.file = 
`file (
	Id INT NOT NULL AUTO_INCREMENT
	location VARCHAR(63) NOT NULL,

	topoid INT NOT NULL,

	UNIQUE (location),
	FOREIGN KEY (topoid) REFERENCES topology(Id),
	PRIMARY KEY (Id)
)`;

schema.defs.permission = 
`permission (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	role ENUM('owner', 'readonly', 'readwrite') NOT NULL DEFAULT 'readwrite',
	topoid INT NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id),
	FOREIGN KEY (topoid) REFERENCES topology(Id),
	PRIMARY KEY (Id)
)`;

module.exports = schema;