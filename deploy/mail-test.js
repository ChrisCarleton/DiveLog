require('babel-register');
var path = require('path');
var mailSender = require('../service/mail-sender');

if (process.argv.length < 3) {
	return console.log('Please supply a recipient e-mail address.');
}

console.log('Sending test message...');
mailSender(process.argv[2], 'Test e-mail', path.resolve(__dirname, './test-email.pug'))
	.then(() => {
		console.log('E-mail sent successfully.');
	})
	.catch(err => {
		console.error('Sending e-mail failed:', err);
	});
