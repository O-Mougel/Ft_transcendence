import startingFile from "../views/startingFile.js";
import loginFile from "../views/login.js";
import { adjustNavbar } from "./index.js";

const backToDefaultPage = async () => {

	const view = new startingFile();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/");

	// const btntext = document.getElementById('logoutButton');
	// if (btntext)
	// 	btntext.innerText = '➜] Log out';
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/");
	// console.log("I'm going back to five o fiveeee");
}

const backToLoginPage = async () => {

	const view = new loginFile();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/logUser");

	// const bar1 = document.getElementById('navBarHomeId');
	// const bar2 = document.getElementById('navBarModesId');
	// const bar3 = document.getElementById('navBarCupId');
	// const bar4 = document.getElementById('navBarAboutId');
	// const barProfile = document.getElementById('profileButton2');
	// bar1.style.display = 'none';
	// bar2.style.display = 'none';
	// bar3.style.display = 'none';
	// bar4.style.display = 'none';
	// barProfile.disabled=true;

	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/logUser");
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
	
	// console.log('username.value :', username.value);
	// console.log('password.value :', pwd.value);
}

window.grabProfileInfo = async function () {

	const profilePanel = document.getElementById('profilePanel');
	const profileUsername = document.getElementById('playerGrabbedUsername');
	const profilePicture = document.getElementById('sidePannelPfp');

	if (!profilePanel) return;

	try 
	{
		const dataRequestResponse = await fetch('/profileGrab', { //GET request by default without the "request" parameter
				credentials: 'include',
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (result)
		{
			// console.log('sideName',result.name);
			// console.log('sidePfp',result.avatar);
			
			profileUsername.innerHTML = result.name;
			profileUsername.style.color = 'white';
			profilePicture.style.backgroundImage = `url(${result.avatar})`;
			profilePicture.style.opacity = "1";
		}
	} 
	catch (err) 
	{
		console.error('Profile info grab failed :(', err);
	}
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
		// console.log('logout request results : ', result);
	
		if (result && result.message) 
		{
			console.log('⏳ Logging out ...');
			// setTimeout(backToLoginPage, 2500);
			// window.sessionStorage.removeItem('logStatus');
			window.sessionStorage.setItem('logStatus', 'loggedOut');

			var isLogged = sessionStorage.getItem("logStatus");
			backToDefaultPage();
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
		const newUserResponse = await fetch('/userCreation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
		});
	
		if (!newUserResponse.ok) {
				const text = await newUserResponse.text().catch(() => newUserResponse.statusText);
				throw new Error(`Request failed: ${newUserResponse.status} ${text}`);
		}
		const result = await newUserResponse.json();
		// console.log('userCreation result', result);
	
		if (result && result.message) 
			requestResult.innerText = result.message;
		else
		{
			console.log('✅ User created');
			username.value = "";
			email.value = "";
			password.value = "";
			passwordConfirm.value = "";
			// const myTimeout = setTimeout(backToDefaultPage, 2000);
			backToDefaultPage();
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
	
	// console.log("login username", username.value);
	// console.log("login password", password.value);
	
	
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
		// console.log('login result', result);
	
		if (result && result.message) 
			logResult.innerText = result.message;
		else
		{
			username.value = "";
			password.value = "";
			// const bar1 = document.getElementById('navBarHomeId');
			// const bar2 = document.getElementById('navBarModesId');
			// const bar3 = document.getElementById('navBarCupId');
			// const bar4 = document.getElementById('navBarAboutId');
			// const barProfile = document.getElementById('profileButton2');
			// bar1.style.display = 'block';
			// bar2.style.display = 'block';
			// bar3.style.display = 'block';
			// bar4.style.display = 'block';
			// barProfile.disabled=false;

			window.sessionStorage.setItem('logStatus','loggedIn');
			var isLogged = sessionStorage.getItem("logStatus");

			// const myTimeout = setTimeout(backToDefaultPage, 2000);
			backToDefaultPage();
		}

	} 
	catch (err) 
	{
		console.error('Login error', err);
		logResult.innerText = '⚠️ Error: Network error';
	}
};

