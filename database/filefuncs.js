var EFS = require('aws-sdk/clients/EFS');

// set credentials and region
// use IAM access keys
//   must have permissions: elasticfilesystem:CreateFileSystem
var efs = new EFS({
	region: 'us-west-1',
	credentials: {
		accessKeyId: 'lol',
		secretAccessKeyd
	}
});

var filefuncs = {};








module.exports = filefuncs;