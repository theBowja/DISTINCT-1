var schema = {};

schema.defs = {};

schema.defs.user = 
`user (
	Id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(40) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password CHAR(60) BINARY NOT NULL,
	role ENUM('admin', 'user') DEFAULT 'user' NOT NULL,

	UNIQUE (username),
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

schema.defs.topology = 
`topology (
	Id INT NOT NULL AUTO_INCREMENT,
	toponame VARCHAR(50) NOT NULL,
	location VARCHAR(63) NOT NULL,

	UNIQUE (location),
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

schema.defs.file = 
`file (
	Id INT NOT NULL AUTO_INCREMENT,
	location VARCHAR(63) NOT NULL,

	topoid INT NOT NULL,

	UNIQUE (location),
	FOREIGN KEY (topoid) REFERENCES topology(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

schema.defs.permission = 
`permission (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	role ENUM('owner', 'readonly', 'readwrite') NOT NULL DEFAULT 'readwrite',
	topoid INT NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id) ON DELETE CASCADE,
	FOREIGN KEY (topoid) REFERENCES topology(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

schema.defs.activeslice = 
`activeslice (
	Id INT NOT NULL AUTO_INCREMENT,

	topoid INT NOT NULL,
	expiration DATETIME NOT NULL,

	FOREIGN KEY (topoid) REFERENCES topology(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

/* ========================== powergrid testbed resources ==================== */

/**
 * only users with admin role can add to this table
 */
schema.defs.resource =
`resource (
	Id INT NOT NULL AUTO_INCREMENT,

	resname VARCHAR(63) NOT NULL,
	stitchport VARCHAR(63) NOT NULL,

	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

/**
 * also known as 'event'
 * times are stored in UTC
 */
schema.defs.reservation = 
`reservation (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	resourceid INT NOT NULL,
	slicename VARCHAR(63) NOT NULL,

	start DATETIME NOT NULL,
	end DATETIME NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id) ON DELETE CASCADE,
	FOREIGN KEY (resourceid) REFERENCES resource(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;


schema.stitch = 
`

) ENGINE=InnoDB`;

module.exports = schema;