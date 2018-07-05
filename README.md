# DISTINCT

technologies used: Nodejs, MySQL

'about' goes here
https://docs.google.com/presentation/d/1yXcqzQ_bF7ZG4YzCxm1gXvq6DyfmKGHy297GhTXRL20/edit?usp=sharing

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. First you must have a machine that is working.

### Setup
Step by step instructions for creating/setting up your app on the AWS cloud platform (07/03/2018):

### Running
Server is hosted on port 3000. It can be changed in the **config/config.js** file.

**Running Locally:**

Prerequisites:
1. This repository forked
2. [Node.js](https://nodejs.org/en/download) installed (verify using ```node --version```)
3. python 2.7 and java jdk is installed
4. Dependency packages installed ( ```npm install```)
5. In the config/config.js file, config.db must be set to match what you are using in your MySQL

In command line in your downloaded repository's directory, type ```npm start```.

## AWS

```
======= steps in AWS =========
go to ElasticBeanStalk
create a new application
create a new environment
-choose Node.js for *Platform*
click create
wait for it to finish creating.
======== linking up to amazon rds ========
go to configuration in your newly created environment
find *Database* card and click modify
enter a username and password and click save
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

## MySQL Table Schemas

Can be found in **database/schema.js** and will be automatically created when you start the server. however if you make changes in the file for the definitions, you will have to delete the corresponding tables manually.

## Development

Middlewares - body-parser, express-session, connect-cloudant-store, multer, multer-autoreap

### app.js
This application is generated with the [Express.js boilerplate generator](https://expressjs.com/en/starter/generator.html). Near the top, *database.js* is first required and initialized. [Pug](https://pugjs.org) is then set as the template engine in the Express framework. Following that are the middlewares. When adding middlewares, one must be careful of the order they put them in, else errors may occur. The order of the routes are also imporant as it affects which middlewares used in the application’s request-response cycle. The base routes here are test routes and should be "decomissioned" when going into production.

- Every hour, expired sessions will be cleaned up. (**app.js**)(doesn't work currently :/)
- Every half hour, expired events on scheduler will be cleaned up. (**database.js**) (unimplemented)

## Development - 'database' folder
Lack of better naming. Contains functions for database (in dbfuncs.js), for files (in fsfuncs.js), and for ahab (in ahabfuncs.js).

### dbfuncs.js
- login(username, password, callback)
- createuser(username, email, password, callback)
- getPermission(userid, topoid, callback)
- getPermissionbyLocation(userid, location, callback)
- updatePermission(role, callback) (unimplemented)
- getIdbyLocation(location, callback)
- getTopology(topoid, callback)
- getTopologybyLocaiton(location, callback)
- listTopologies(userid, callback)
- createTopology(userid, toponame, callback)
- updateTopology(topoid, toponame, callback)
- deleteTopology(topoloc, callback)

### fsfuncs.js
this is just an interface to reading and writing files, in case you want to implement a different system of storing topologies.

### ahabfuncs.js
TBD

## Development - views folder
Under the views folder. Pug files are compiled and sent to client responses. 

## Development - Editor
Instructions on how to use the editor is listed in the .pug template file.

### \#svgfocus
This element deals with the focus on the SVG. Specifically, keycodes.
- case 27: // ESCAPE - for deselecting everything
- case 46: // DELETE - for deleting selected nodes/links

### control
The object that stores and controls the state of the simulation. Pretty much miscellaneous stuff.

### Options Panel - (function(shapes){...})
Parameter **shapes**: a string array of shapes that can be created. ```["circle", "cross", "diamond", "square", "star", "triangle", "wye"]```. Returns the function **createNodeOptionsPanel**.
An interface to allow editing the data of nodes/links. **svgeditor_optionspanel.js** contains a closure for some reason...

#### Creating editable properties
These schemas are split into base and the rest of the shapes. Base includes the array of specified editable properties that all shapes will have, "name" and "color". In order to add your own custom editable property, the object must have **label** and **type**. **Type** is the type of DOM element it will be, which is limited to "input", "select", and "textarea". Additional types must be specified in the ```switch(trait.type) { ... }``` that is in the function createNodeOptionsPanel. If the type is a "select", then an additional array property called "options" is required as well. **update** is an optional function you can include to change other stuff; otherwise, only the data attribute will be updated. The **update** function may have up to three parameters: formdata, node, panel. Formdata is the new data submitted. node is the d3 selection of the relevant node. panel refers to the options panel of the node.

#### svgeditor_optionspanel.js - getShape(s)
returns the relevant element in the shapes array

### Toolbox
A clipPath specifies the boundaries of the toolbox. Each icon of the toolbox is 24px x 24px.
Stpes to add your own icon with functionality:
1. expand the height of the clipPath boundary by 24
2. follow the pattern of mediabutton/interationbutton/shapebutton

#### Toolbox - toolboxButtonMaker(name,transform)
Given the parameters provided, this function will create and return a button to fit in the toolbox. The *name* is used to set the id of the elements: "[name]-title" and "[name]-path". The *transform* is used to set the transform.

### topologySchema
A schema to verify the json of the topology. Uses AJV as its JSON Schema validator. The topology object must contain the array properties: "nodes" and "links". Each object element in the array "nodes" must have a property: "name". Each object element in the array "links" must have the properties: "source" and "target" which reference to an existing "name" in the "nodes" array.

## Built With

* [express.js](https://expressjs.com/) - The web framework used
* [Node.js](https://nodejs.org/) - Idk what
* MySQL

## Versioning

~~We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).~~ lol

## Authors

* **Eric Xin** - *Initial work* - [theBowja](https://github.com/theBowja)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
