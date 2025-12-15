import startingFile from "../views/startingFile.js";
import { adjustNavbar } from "./index.js";

const backToDefaultPage = async () => {

	const view = new startingFile();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/");

	const btntext = document.getElementById('logoutButton');
	if (btntext)
		btntext.innerText = '➜] Log out';
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/");
	// console.log("I'm going back to five o fiveeee");
}

const fieldValidity = (username, pwd, pwdconf, requestR, email) => {
	requestR.innerText = "";
	if (!username.value)
	{
		requestR.innerText = "❌ Login cannot be empty !";
		username.focus();
		return ;
		
	}
	else if (!email.value)
	{
		requestR.innerText = "❌ Email cannot be empty !";
		email.focus();
		return ;
		
	}
	else if (!pwd.value)
	{
		requestR.innerText = "❌ Enter a password !";
		pwd.focus();
		return ;
	}
	if (pwd.value != pwdconf.value)
	{
		requestR.innerText = "❌ Both passwords must match !";
		pwd.value = '';
		pwdconf.value = '';
		pwd.focus();
		return ;
	}
	
	console.log('username.value :', username.value);
	console.log('password.value :', pwd.value);
}

window.logoutUser = async function () {

	const btntext = document.getElementById('logoutButton');

	try 
	{
		const logoutResponse = await fetch('/logout', {
				method: 'DELETE',
				credentials: 'include',
		});
	
		if (!logoutResponse.ok) {
				const text = await logoutResponse.text().catch(() => logoutResponse.statusText);
				throw new Error(`Request failed: ${logoutResponse.status} ${text}`);
		}
		const result = await logoutResponse.json();
		console.log('logout request results : ', result);
	
		if (result && result.message) 
		{
			btntext.innerText = '⏳ Logging out ...';
			setTimeout(backToDefaultPage, 2500);
		}
	} 
	catch (err) 
	{
		console.error('Login error', err);
	}
}

window.handleNewUserCreate = async function (event) {

	event.preventDefault();
	const username = document.getElementById('newUsernameNewUser');
	const email = document.getElementById('newUserEmail');
	const password = document.getElementById('firstPasswordNewUser');
	const passwordConfirm = document.getElementById('confirmPasswordNewUser');
	const requestResult = document.getElementById('saveNewUserInfo');

	fieldValidity(username, password, passwordConfirm, requestResult, email)

	const data = {
		email: email.value,
		name: username.value,
		password: password.value,
	};
	
	try 
	{
		const loginResponse = await fetch('/userCreation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
		});
	
		if (!loginResponse.ok) {
				const text = await loginResponse.text().catch(() => loginResponse.statusText);
				throw new Error(`Request failed: ${loginResponse.status} ${text}`);
		}
		const result = await loginResponse.json();
		console.log('login result', result);
	
		if (result && result.message) 
			requestResult.innerText = result.message;
		else
		{
			requestResult.innerText = '✅ User created';
			username.value = "";
			email.value = "";
			password.value = "";
			passwordConfirm.value = "";
			const myTimeout = setTimeout(backToDefaultPage, 2500);
		}
	} 
	catch (err) 
	{
		console.error('Login error', err);
		requestResult.innerText = '⚠️ Error: Network error';
	}
};

window.handleLoginClick = async function (event) {

	event.preventDefault();
	const username = document.getElementById('clientUsername');
	const password = document.getElementById('clientPassword');
	const logResult = document.getElementById('signInResult');

	logResult.innerText = "";
	if (!username.value)
	{
		logResult.innerText = "❌ Login cannot be empty !";
		username.focus();
		return ;
		
	}
	else if (!password.value)
	{
		logResult.innerText = "❌ Enter your password !";
		password.focus();
		return ;
	}

	const data = {
		name: username.value,
		password: password.value,
	};
	
	console.log(username.value);
	console.log(password.value);
	
	
	try 
	{
		const loginResponse = await fetch('/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
		});
	
		if (!loginResponse.ok) {
				const text = await loginResponse.text().catch(() => loginResponse.statusText);
				throw new Error(`Request failed: ${loginResponse.status} ${text}`);
		}
	
		const result = await loginResponse.json();
		console.log('login result', result);
	
		if (result && result.message) 
			logResult.innerText = result.message;
		else
		{
			logResult.innerText = '✅ Logged in';
			username.value = "";
			password.value = "";
			const myTimeout = setTimeout(backToDefaultPage, 2000);
		}

	} 
	catch (err) 
	{
		console.error('Login error', err);
		logResult.innerText = '⚠️ Error: Network error';
	}
};

