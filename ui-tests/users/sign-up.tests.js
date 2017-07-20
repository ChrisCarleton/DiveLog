import Driver from '../driver';
import { By } from 'selenium-webdriver';
import test from 'selenium-webdriver/testing';

test.describe('first ui test', () => {

	let driver;
	test.before(() => {
		driver = Driver();
	});

	test.after(() => {
		driver.quit();
	});

	test.it('checks the web page?', () => {
		driver.get('http://localhost:8100/signup');
		driver.findElement(By.id('userName')).sendKeys('Chris');
		driver.findElement(By.id('email')).sendKeys('chris@email.org');
		driver.findElement(By.id('password')).sendKeys('mI_P@zzwrd#');
		driver.findElement(By.id('confirmPassword')).sendKeys('mI_P@zzwrd#');
		//...
	});
});
