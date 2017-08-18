import Bluebird from 'bluebird';
import config from '../service/config';
import { expect } from 'chai';
import pug from 'pug';
import sendMail, { transporter } from '../service/mail-sender';
import sinon from 'sinon';

describe('Mail sender', () => {

	const renderedHtml = '<html><head><title>Hi!</title></head><body>Looking good.</body></html>';
	let transporterStub, pugStub;
	beforeEach(() => {
		transporterStub = sinon.stub(transporter, 'sendMailAsync');
		transporterStub.usingPromise(Bluebird.Promise);
		pugStub = sinon.stub(pug, 'renderFile');
		pugStub.returns(renderedHtml);
	});

	afterEach(() => {
		transporterStub.restore();
		pugStub.restore();
	});

	it('is configured correctly', () => {
		expect(transporter.options).to.eql({
			host: config.mail.host,
			port: config.mail.port,
			secure: true,
			auth: {
				user: config.mail.username,
				pass: config.mail.password
			}
		});
	});

	it('invokes nodemailer correctly', done => {
		const opts = {
			from: config.mail.fromAddress,
			to: 'joe@email.com',
			subject: 'Test e-mail',
			html: renderedHtml
		};
		const templateFile = 'my-template.pug';
		const templateParams = { name: 'Joe' };
		transporterStub.resolves();
		sendMail(opts.to, opts.subject, templateFile, templateParams)
			.then(() => {
				expect(pugStub.calledOnce).to.be.true;
				expect(pugStub.calledWith(templateFile, templateParams)).to.be.true;
				expect(transporterStub.calledOnce).to.be.true;
				expect(transporterStub.calledWith(opts)).to.be.true;
				done();
			})
			.catch(done);
	});

	it('reports when errors occur', done => {
		const error = new Error('SMTP server is broken!!');
		transporterStub.rejects(error);
		sendMail('joe@email.com', 'This will not make it', 'my-template.pug')
			.then(() => done('This should not have succeeded.'))
			.catch(err => {
				expect(err).to.equal(error);
				done();
			})
			.catch(done);
	});

	it('returns an error if Pug fails to render the template', done => {
		const error = new Error('OMG! Pug failed!');
		pugStub.throws(error);
		sendMail('joe@email.com', 'This will not make it', 'my-template.pug')
			.then(() => done('This should not have succeeded.'))
			.catch(err => {
				expect(err).to.equal(error);
				done();
			})
			.catch(done);
	});
});
