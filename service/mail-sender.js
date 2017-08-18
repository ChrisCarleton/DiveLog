import Bluebird from 'bluebird';
import config from './config';
import nodemailer from 'nodemailer';
import pug from 'pug';

const transporter = nodemailer.createTransport({
	host: config.mail.host,
	port: config.mail.port,
	secure: true,
	auth: {
		user: config.mail.username,
		pass: config.mail.password
	}
});

Bluebird.promisifyAll(transporter);

const sender = (recipient, subject, view, params) => {
	let html;

	try { html = pug.renderFile(view, params); }
	catch (err) { return Bluebird.reject(err); }

	const mailOptions = {
		from: config.mail.fromAddress,
		to: recipient,
		subject: subject,
		html: html
	};

	return transporter.sendMailAsync(mailOptions);
};

sender.transporter = transporter;

export default sender;
module.exports = sender;
