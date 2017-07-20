import WebDriver from 'selenium-webdriver';

export default function() {
	const driver = new WebDriver
		.Builder()
		.forBrowser('phantomjs')
		.build();

	return driver;
}
