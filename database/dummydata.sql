# http://sqlfiddle.com/#!9/53061/1

#
# TABLE STRUCTURE FOR: user
#

DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` char(60) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


#
# TABLE STRUCTURE FOR: topology
#

DROP TABLE IF EXISTS `topology`;

CREATE TABLE `topology` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `toponame` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `location` varchar(63) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


#
# TABLE STRUCTURE FOR: permission
#

DROP TABLE IF EXISTS `permission`;

CREATE TABLE `permission` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) NOT NULL,
  `role` enum('owner','readonly','readwrite') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'readwrite',
  `topoid` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `userid` (`userid`),
  KEY `topoid` (`topoid`),
  CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `user` (`Id`),
  CONSTRAINT `permission_ibfk_2` FOREIGN KEY (`topoid`) REFERENCES `topology` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (1, 'parisian.alberta', 'hellen.jacobson@example.org', 'f9805af4fbad3e4fec40113ed92ae116790d0676');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (2, 'bartholome71', 'marjolaine47@example.net', '1427ccd8e5a535c97f9ef291ff33067e160641a1');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (3, 'ezequiel96', 'fmohr@example.org', '74132717e5f55857ba6ebc05929dc1791f12e68a');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (4, 'stehr.raquel', 'nitzsche.lauretta@example.org', 'ce644c16bed203372cd6d2a1efa9a44124b91f4a');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (5, 'ylockman', 'zfunk@example.org', 'b945e8537185b7e8be50d2b288f09c075209ca4c');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (6, 'curt.borer', 'ernestine26@example.com', '121f1b8a931c7dcd3a38224ebb6923b512ef5175');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (7, 'witting.michaela', 'smarvin@example.org', '13d891aecd431c6f3f6cae2af507285daa701121');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (8, 'jordi.pfeffer', 'powlowski.alden@example.net', '4932bd5c39a506b7b787981ee4b9cbfc66622d83');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (9, 'goodwin.zachary', 'claud03@example.com', 'd53496bca83028aebaa0459e392090755242b652');
INSERT INTO `user` (`Id`, `username`, `email`, `password`) VALUES (10, 'iauer', 'garrison35@example.net', '39b9e0ecc1f7d55537e32d15260f2d3c98963495');

INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (1, 'provident', 'assumenda.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (2, 'explicabo', 'labore.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (3, 'commodi', 'sequi.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (4, 'ut', 'quos.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (5, 'iure', 'modi.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (6, 'iste', 'nemo.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (7, 'consequatur', 'magni.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (8, 'ea', 'debitis.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (9, 'voluptas', 'dolorem.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (10, 'et', 'voluptatem.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (11, 'voluptate', 'esse.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (12, 'at', 'at.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (13, 'quidem', 'ut.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (14, 'quia', 'nam.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (15, 'non', 'odit.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (16, 'et', 'aperiam.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (17, 'modi', 'accusantium.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (18, 'nisi', 'voluptatibus.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (19, 'ratione', 'atque.txt');
INSERT INTO `topology` (`Id`, `toponame`, `location`) VALUES (20, 'ipsum', 'et.txt');

INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (1, 5, 'readonly', 3);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (2, 7, 'readwrite', 9);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (3, 4, 'owner', 3);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (4, 5, 'readwrite', 17);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (5, 6, 'readonly', 5);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (6, 5, 'readwrite', 11);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (7, 5, 'readonly', 7);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (8, 4, 'readwrite', 6);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (9, 6, 'readwrite', 4);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (10, 3, 'readonly', 2);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (11, 6, 'readonly', 20);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (12, 10, 'owner', 14);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (13, 1, 'readonly', 3);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (14, 10, 'owner', 6);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (15, 7, 'owner', 9);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (16, 9, 'owner', 8);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (17, 8, 'readonly', 14);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (18, 2, 'readonly', 9);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (19, 1, 'readonly', 11);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (20, 10, 'readwrite', 6);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (21, 3, 'owner', 18);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (22, 8, 'readwrite', 20);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (23, 2, 'owner', 10);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (24, 9, 'readwrite', 2);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (25, 8, 'owner', 1);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (26, 3, 'readwrite', 4);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (27, 9, 'readwrite', 3);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (28, 10, 'owner', 3);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (29, 10, 'readwrite', 15);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (30, 4, 'readonly', 9);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (31, 5, 'readonly', 20);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (32, 3, 'readonly', 18);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (33, 10, 'readwrite', 17);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (34, 3, 'readwrite', 2);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (35, 9, 'readonly', 5);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (36, 6, 'readonly', 16);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (37, 6, 'owner', 4);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (38, 4, 'readonly', 15);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (39, 5, 'readwrite', 2);
INSERT INTO `permission` (`Id`, `userid`, `role`, `topoid`) VALUES (40, 4, 'owner', 2);

