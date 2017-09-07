var AWS = require('aws-sdk');
var bcrypt = require('bcrypt');
var Bluebird = require('bluebird');
var chalk = require('chalk');
var prompt = require('prompt');
var uuid = require('uuid/v4');

Bluebird.promisifyAll(prompt);

function showHelp() {
	console.log('USAGE:');
	console.log(chalk.bold('node create-admin-user.js [-p] <aws-region> <env>\n'));
	console.log('If the -p flag is provided you will be prompted for an initial password.');
	console.log('If the -p flag is omitted the default password "admin" will be used.');

	console.log('Example:', chalk.bold.blue('node create-admin-user.js -p us-east-1 staging'));

	console.log('Make sure you have your AWS credentials configured in your AWS CLI!');
	console.log('Run', chalk.bold('aws configure'), 'to do so.');
}

if (process.argv.length === 2) {
	return showHelp();
}

if (process.argv.length < 4) {
	console.error('Unable to proceed! Missing parameters!');
	return showHelp();
}

var promptForPassword = false;
var env, region;

if (process.argv[2] === '-p') {
	if (process.argv.length < 5) {
		console.error('Unable to proceed! Missing parameters!');
		return showHelp();
	}

	promptForPassword = true;
	region = process.argv[3];
	env = process.argv[4];
} else {
	region = process.argv[2];
	env = process.argv[3];
}

function writeData(password) {
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(password, salt);

	var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: region});
	Bluebird.promisifyAll(dynamodb);

	var item = {
		userId: {
			S: uuid()
		},
		userName: {
			S: 'admin'
		},
		email: {
			S: 'admin@bottomtime.ca'
		},
		displayEmail: {
			S: 'admin@bottomtime.ca'
		},
		displayName: {
			S: 'Administrator'
		},
		passwordHash: {
			S: hash
		},
		role: {
			S: 'admin'
		},
		createdAt: {
			S: new Date().toISOString()
		}
	};

	console.log('Selected environment:', env);
	console.log('Writing', item, '...');

	return dynamodb.putItemAsync({
		Item: item,
		TableName: `divelog-${env}-users`
	});
}

function getPassword() {
	if (!promptForPassword) {
		return Bluebird.resolve({
			password: 'admin',
			confirmPassword: 'admin'
		});
	}

	prompt.start();
	return prompt.getAsync({
		properties: {
			password: {
				description: 'Enter password',
				required: true,
				hidden: true
			},
			confirmPassword: {
				description: 'Re-type to confirm',
				required: true,
				hidden: true
			}
		}
	});
}

getPassword()
	.then(result => {
		if (result.password !== result.confirmPassword) {
			throw 'Passwords did not match.';
		}

		return writeData(result.password);
	})
	.then(() => {
		return console.log('Succeeded! (Remember to log in and change the default password!!)');
	})
	.catch(err => {
		console.error('Failed:', chalk.red(err));
	});
