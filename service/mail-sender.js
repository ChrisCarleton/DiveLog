import Bluebird from 'bluebird';
import config from './config';
import nodemailer from 'nodemailer';
import pug from 'pug';

const transporter = nodemailer.createTransport({
	host: congif.mail.host,
	port: 465,
	secure: true,
	auth: {
		user: config.mail.username,
		pass: config.mail.password
	}
});

Bluebird.promisifyAll(transporter);

export default function(recipient, subject, view, params) {
	const html = pug.renderFile(view, params);

	const mailOptions = {
		from: config.mail.fromAddress,
		to: recipient,
		subject: subject,
		html: html
	};

	return transporter.sendMailAsync(mailOptions);
}
