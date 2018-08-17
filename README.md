# DISTINCT

technologies used: Nodejs, MySQL

'about' goes here
https://docs.google.com/presentation/d/1yXcqzQ_bF7ZG4YzCxm1gXvq6DyfmKGHy297GhTXRL20/edit?usp=sharing

Table of contents
=================

* [DISTINCT](#distinct)
* [Table of contents](#table-of-contents)
* [Getting Started](#getting-started)
* [Usage](#usage)
  * [Localhost](#localhost)
  * [AWS](#aws)
* [Tests](#tests)
* [Documentation](#documentation)
* [Built With](#built-with)
* [Versioning](#versioning)
* [Authors](#authors)
* [License](#license)
* [Acknowledgements](#acknowledgements)

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. First you must have a machine that is working. Step by step instructions for creating/setting up your app on the AWS cloud platform (07/03/2018):

# Usage
~~Server is hosted on port 3000. It can be changed in the **config/config.js** file.~~
instructions for different servers below

## Localhost

### Prerequisites
1. Fork this repository
2. [Node.js](https://nodejs.org/en/download) installed (verify using ```node --version```)
3. python 2.7 and java jdk is installed
4. Install dependency packages using ```npm install``` at project root directory
5. MySQL server started
6. In the **config/config.js** file, *config.db* *username*, *password*, and *dbname* must be set to match what you are using for your MySQL server

### Running

In command line in the repository's root directory, type ```npm start```. Please submit an issue if there are any problems.

## AWS

Create an elasticbeanstalk application and setup the necessary configurations in order to run the server.

### Prerequisites
Your IAM user account must have privileges for ElasticBeanstalk, Amazon RDS, and ElasticFileSystem

### Setup
```
======= steps in AWS =========
go to ElasticBeanStalk
create a new application
create a new environment
-choose Node.js for *Platform*
click create
wait for it to finish creating.
======== linking up to new amazon rds ========
go to configuration in your newly created environment
find *Database* card and click modify
enter your desired username and password and click save
wait for environment to finish updating configurations
======== connect EFS to your VPC =========
(the config file referred is storage-efs-createfilesystem.config)
go to https://console.aws.amazon.com/vpc
click *Your VPCs*
find your VPC ID and replace it in config file
click *Subnets*
find the Subnet IDs corresponding to the VPCID and add them all to config file
copy paste *Mount Target Resources* in the config file for each corresponding Subnet
```

### Running

```
========= uploading as zip =========
TBD
======= through eb cli ==========
TBD
```

#### Notice
* if your environment takes a long time to update but still fails, then there is probably something that is timing out
* you may link an existing database
* efs is only available in certain regions
* there is a limited number of security groups for each mount target

### Troubleshooting

```
====== access your EB instance =======
TBD
```

```
======= access files in your EFS ========
(taken from https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstances.html)
go to AWS EC2
find the instance that your EFS is mounted on
click on the security group associated with that instance
go to the Inbound tab of the security group for that EB environment
click edit and add a new rule. type: ssh, port: 22, source: my ip
go back to EC2 Dashboard
click Key Pairs
create a new key pair (or import) and store your .pem file in a secure place
go to your Elastic Beanstalk application's configuration and click security
assign the key pair you just created to *EC2 key pair*
save and apply configurations
find the instance again in EC2 again
take note of its Public DNS
run the following command: ssh -i "<path>.pem" ec2-user@<Public DNS>
-if ec2-user doesn't work then try root
cd into the mount path that you specified for your EFS

======= access AWS mySQL ========
go to Amazon RDS
go to Instances on sidebar and click the database instance you want to connect to
go down to Security Group and click on the one that was type: Inbound
click Inbound tab
edit
change Source to "anywhere"
example: \c ebroot@aa1apvlvao9ra69.ct4nsaowdm5z.us-east-1.rds.amazonaws.com:3306
```

# Tests
sorry, no tests yet.

# Documentation

check out the docs in the [docs](docs) folder or visit https://thebowja.github.io/DISTINCT-1/.

# Built With

* [express.js](https://expressjs.com/) - The web framework used
* [Node.js](https://nodejs.org/) - Idk what
* MySQL

# Versioning

~~We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).~~ lol

# Authors

* **Eric Xin** - *Initial work* - [theBowja](https://github.com/theBowja)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

# License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
