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

schema.rsvnresources = ['res1','res2','res3'];
/**
 * also known as 'event'
 * times are stored in UTC
 */
schema.defs.reservation = 
`reservation (
	Id INT NOT NULL AUTO_INCREMENT,

	userid INT NOT NULL,
	resource SET(${"'"+schema.rsvnresources.join("','")+"'"}) NOT NULL,
	slicename VARCHAR(63) NOT NULL,

	start DATETIME NOT NULL,
	end DATETIME NOT NULL,

	FOREIGN KEY (userid) REFERENCES user(Id) ON DELETE CASCADE,
	PRIMARY KEY (Id)
) ENGINE=InnoDB`;

schema.stitch = 
`

) ENGINE=InnoDB`;

module.exports = schema;