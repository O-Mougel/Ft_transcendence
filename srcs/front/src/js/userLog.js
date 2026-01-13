import startingFile from "../views/startingFile.js";
import { adjustNavbar } from "./index.js";

export const backToDefaultPage = async () => {

	const view = new startingFile();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/");
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/");
}

const hideAlertBoxMsg = async () => {

	const alertBox = document.getElementById('alertBox');
	if (!alertBox) return;
	alertBox.style.display = 'none';
	alertBox.innerHTML = "Hey ! I'm supposed to be hidden ! >:(";
}

export const alertBoxMsg = async (msg) => {
		
	const alertBox = document.getElementById('alertBox');
	if (!alertBox) return;
	alertBox.style.display = 'inline';
	alertBox.innerHTML = msg;
	setTimeout(hideAlertBoxMsg, 3000);
}

export const fetchErrcodeHandler = async (error) => {

	const isNotAuth = error.toString().search("\"errcode\":401") != -1;
	const isExpired = error.toString().search("\"errcode\":402") != -1;
	if(isNotAuth)
	{
		console.log("User is not auth ! Back to menu...")
		window.sessionStorage.setItem('logStatus', 'loggedOut');
		backToDefaultPage();
		return (-1);
	}
	else if (isExpired)
	{
				
		if (!(window.sessionStorage.getItem("nbReloadsLeft")))
			window.sessionStorage.setItem('nbReloadsLeft', 1);
		else
		{
			let reloadCpt =	parseInt(window.sessionStorage.getItem('nbReloadsLeft'));
			if (reloadCpt == 0) 
			{
				window.sessionStorage.setItem('logStatus', 'loggedOut');
				backToDefaultPage();
				return (-1);
			}
			window.sessionStorage.setItem('nbReloadsLeft', reloadCpt - 1);
		}
		console.info("Token expired or invalid ! Refreshing...");
		try 
		{
			const refreshTokenResponse = await fetch('/login/refresh', {
					credentials: 'include',
			});
		
			if (!refreshTokenResponse.ok) {
					const text = await refreshTokenResponse.text().catch(() => refreshTokenResponse.statusText);
					throw new Error(`Request failed: ${refreshTokenResponse.status} ${text}`);
			}
			const result = await refreshTokenResponse.json();	
			if (result && result.newAccessToken) 
			{
				window.sessionStorage.setItem('access_token', result.newAccessToken); //grab new token
				console.info("Token refreshed.");
			}
			else
				throw new Error(`Token could not be generated !`);
		} 
		catch (err) 
		{
			console.error("⚠️ Could not refresh tokens ... please log back in !"); //is this enough ?
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			backToDefaultPage();
			return (-1);
		}
		return (0);
	}
	return(42);
}

const fieldValidity = (username, pwd, pwdconf, requestR, email) => {
	requestR.innerText = "";
	if (!username.value)
	{
		requestR.innerText = "❌ Login cannot be empty !";
		username.focus();
		return false;
		
	}
	else if (!email.value)
	{
		requestR.innerText = "❌ Email cannot be empty !";
		email.focus();
		return false;
		
	}
	else if (!pwd.value)
	{
		requestR.innerText = "❌ Enter a password !";
		pwd.focus();
		return false;
	}
	if (pwd.value != pwdconf.value)
	{
		requestR.innerText = "❌ Both passwords must match !";
		pwd.value = '';
		pwdconf.value = '';
		pwd.focus();
		return false;
	}
	return (true);
}

export async function isUserAllowedHere() {

	try 
	{
		const logUserCheckResponse = await fetch('/login/loggedUserCheck', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!logUserCheckResponse.ok) {
				const text = await logUserCheckResponse.text().catch(() => logUserCheckResponse.statusText);
				throw new Error(`Request failed: ${logUserCheckResponse.status} ${text}`);
		}
		const result = await logUserCheckResponse.json();	
		if (result) 
		{
			return(1); //user is logged
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return (isUserAllowedHere());
		alertBoxMsg(`❌ You are not allowed to be here ! Log-in first !`);
		console.error("\n❌No valid credentials ! Back to Login page !\n");
		console.error(err);
		return (0); //no valid credentials
	}
	return(0);
}

window.acceptFriend = async (username) => {

	const requestList = document.getElementById('requestList'); //contains the requests
	if(!requestList) return;

	const data = {
		friendAcceptName: username,
	};

	try 
	{
		const acceptFriendRequestResponse = await fetch('/friend/accept', {
				method: 'POST',
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				body: JSON.stringify(data),
		});
	
		if (!acceptFriendRequestResponse.ok) {
				const text = await acceptFriendRequestResponse.text().catch(() => acceptFriendRequestResponse.statusText);
				throw new Error(`Request failed: ${acceptFriendRequestResponse.status} ${text}`);
		}
		const result = await acceptFriendRequestResponse.json();	
		if (result)
		{
			if(requestList.hasChildNodes())
			{
				let	clearName = username + "[42]";
				const currentElement = document.getElementsByName(clearName);
				if (currentElement && currentElement.length > 0)
				{
					const target = currentElement[0];
					target.remove();
				}
			}
			alertBoxMsg(`✅ You are now friend with \"${username} !\"`);
			grabProfileInfo();
		}
	}
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.acceptFriend(username));
		console.error('⚠️ Couldn\'t accept friend request !\n =>', err);
	}
}

window.rejectFriend = async (username) => {
	const requestList = document.getElementById('requestList'); //contains the requests
	const requestLabel = document.getElementById('requestCheckLabel');
	const requestBlock = document.getElementById('pendingRequestBlock');

	if(!requestList || !requestLabel || !requestBlock) return;

	const data = {
		friendrejectname: username,
	};

	try 
	{
		const rejectFriendRequestResponse = await fetch('/friend/reject', {
				method: 'POST',
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				body: JSON.stringify(data),
		});
	
		if (!rejectFriendRequestResponse.ok) {
				const text = await rejectFriendRequestResponse.text().catch(() => rejectFriendRequestResponse.statusText);
				throw new Error(`Request failed: ${rejectFriendRequestResponse.status} ${text}`);
		}
		const result = await rejectFriendRequestResponse.json();	
		if (result)
		{
			if(requestList.hasChildNodes())
			{
				let	clearName = username + "[42]";
				const currentElement = document.getElementsByName(clearName);
				if (currentElement && currentElement.length > 0)
				{
					const target = currentElement[0];
					target.remove();
				}
				grabProfileInfo();
			}
		}
	}
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.rejectFriend(username));
		console.error('⚠️ Couldn\'t reject friend request !\n =>', err);
	}
}

const checkForFriendRequests = async () => {
	
	const requestList = document.getElementById('requestList'); //contains the requests
	const requestLabel = document.getElementById('requestCheckLabel'); //contains the requests
	const requestBlock = document.getElementById('pendingRequestBlock'); //contains the requests
	try 
	{
		const lookForRequests = await fetch('/friend/requested', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!lookForRequests.ok) {
				const text = await lookForRequests.text().catch(() => lookForRequests.statusText);
				throw new Error(`Request failed: ${lookForRequests.status} ${text}`);
		}
		const result = await lookForRequests.json();	
		if (result)
		{	

			if (result.requestOf.length > 0)
			{
				requestBlock.style.display = "block";
				requestLabel.innerHTML = "🔔 Requests(" + result.requestOf.length + ")"
			}
			else
			{
				requestBlock.style.display = "none";
			}

			requestList.innerHTML = '';
			for(let i = 0; i < result.requestOf.length; i++) 
			{
				var listItem = document.createElement("li");
				let	clearName = result.requestOf[i].name + "[42]";
				listItem.className = 'py-2 flex items-center justify-between ml-5';
				listItem.setAttribute('name', clearName);
				const jsonString = JSON.stringify(result.requestOf[i].name);
				const safeName = jsonString.replace(/['"]+/g, '');
				// console.log("Safe name is : ", safeName);
				// console.log(" name is : ", result.requestOf[i].name);
				listItem.innerHTML = `
				<span class="text-sm">↪ ${safeName}</span>
				<span class="flex items-center gap-2">
					<button class="accept-request px-2 py-1 rounded" onclick="acceptFriend('${safeName}')" title="Accept">✅</button>
					<button class="reject-request px-2 py-1 rounded" onclick="rejectFriend('${safeName}')" title="Reject">❌</button>
				</span>`;
				requestList.appendChild(listItem);
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(checkForFriendRequests());
		console.error('⚠️ Couldn\'t display friend requests !\n =>', err);
	}

}

const displayUserFriends = async () => {
	
	const friendList = document.getElementById('friendlist');

	try 
	{
		const friendInfoResponse = await fetch('/friend', {
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				credentials: 'include',
		});
	
		if (!friendInfoResponse.ok) {
				const text = await friendInfoResponse.text().catch(() => friendInfoResponse.statusText);
				throw new Error(`Request failed: ${friendInfoResponse.status} ${text}`);
		}
		const result = await friendInfoResponse.json();	
		if (result)
		{	
			friendList.innerHTML = '';
			for(let i = 0; i < result.friends.length; i++) 
			{
				var listItem = document.createElement("li");
				let	clearName = result.friends[i].name + "[4242]";
				listItem.className = 'py-2 flex items-center justify-between ml-5';
				if (result.friends[i].online)
					listItem.innerHTML = `<span class="text-sm border w-full p-2 mb-2" name="${clearName}">🟢 ${result.friends[i].name}</span>`;
				else
					listItem.innerHTML = `<span class="text-sm border w-full p-2 mb-2" name="${clearName}">🔴 ${result.friends[i].name}</span>`;
					
				friendList.appendChild(listItem);
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(displayUserFriends());
		console.error('⚠️ Couldn\'t grab user friend info !\n => ', err);
	}

}

window.grabProfileInfo = async function () {

	const profilePanel = document.getElementById('profilePanel');
	const profileUsername = document.getElementById('playerGrabbedUsername');
	const profilePicture = document.getElementById('sidePannelPfp');

	if (!profilePanel) return;

	try 
	{
		const dataRequestResponse = await fetch('/profile/grab', { //GET request by default without the "request" parameter
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				credentials: 'include',
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (result)
		{	
			profileUsername.innerHTML = result.name;
			profileUsername.style.color = 'white';
			profilePicture.style.opacity = "1";

			const defaultAvatar = '/img/userPfp/default.png';
			const avatarUrl = result?.avatar || defaultAvatar;
			
			const probe = new Image();
			probe.onload = () => {
			profilePicture.style.backgroundImage = 'url(' + JSON.stringify(avatarUrl) + ')';
			};
			probe.onerror = () => {
			profilePicture.style.backgroundImage = 'url(' + JSON.stringify(defaultAvatar) + ')';
			};
			probe.src = avatarUrl;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return (window.grabProfileInfo());
		console.error('Profile info grab failed !\n => ', err);
	}
	displayUserFriends();
	checkForFriendRequests();
}


window.sendNewFriendRequest = async function () {

	const friendReqResultText = document.getElementById('friendSearchResults'); //shows if friend request worked
	const friendReqInput = document.getElementById('friendSearchInput');

	const data = {
		friendRequestName: friendReqInput.value,
	};

	try 
	{
		const sentFriendRequestResponse = await fetch('/friend/request', {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				credentials: 'include',
		});
	
		if (!sentFriendRequestResponse.ok) {
				const text = await sentFriendRequestResponse.text().catch(() => sentFriendRequestResponse.statusText);
				throw new Error(`Request failed: ${sentFriendRequestResponse.status} ${text}`);
		}
		const result = await sentFriendRequestResponse.json();	
		if (result) 
		{
			console.log('✅ Sent friend request');
			// friendReqResultText.innerHTML='✅ Sent friend request';
			alertBoxMsg(`✅ Friend request sent to \"${data.friendRequestName}\"`);
			friendReqInput.value = "";
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.sendNewFriendRequest());
		console.error('Cannot send friend request !\n => ', err);
		// friendReqResultText.innerHTML='⚠️ Try again !';
		alertBoxMsg(`⚠️ Could not send friend request !`);
	}
}

window.logoutUser = logoutUser;

export async function logoutUser() {

	try 
	{
		const logoutResponse = await fetch('/logout', {
				method: 'DELETE',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				credentials: 'include',
		});
	
		if (!logoutResponse.ok) {
				const text = await logoutResponse.text().catch(() => logoutResponse.statusText);
				throw new Error(`Request failed: ${logoutResponse.status} ${text}`);
		}
		const result = await logoutResponse.json();	
		if (result) 
		{
			console.log('⏳ Logging out ...');
			alertBoxMsg("✅ You are now logged out");
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			window.sessionStorage.setItem('access_token', 'NotValid;)');

			// var isLogged = sessionStorage.getItem("logStatus");
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.logoutUser());
		console.error('⚠️ Couldn\'t log out user !\n => ', err);
	}
}

window.handleNewUserCreate = async function (event) {

	event.preventDefault();
	const username = document.getElementById('newUsernameNewUser');
	const email = document.getElementById('newUserEmail');
	const password = document.getElementById('firstPasswordNewUser');
	const passwordConfirm = document.getElementById('confirmPasswordNewUser');
	const requestResult = document.getElementById('saveNewUserInfo');

	if(fieldValidity(username, password, passwordConfirm, requestResult, email) == false)
		return ;

	const data = {
		email: email.value,
		name: username.value,
		password: password.value,
	};
	
	try 
	{
		const newUserResponse = await fetch('/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
		});
	
		if (!newUserResponse.ok) {
				const text = await newUserResponse.text().catch(() => newUserResponse.statusText);
				throw new Error(`Request failed: ${newUserResponse.status} ${text}`);
		}
		const result = await newUserResponse.json();
	
		if (result) 
		{
			console.log('✅ User created');
			alertBoxMsg(`✅ User \"${data.name}\" created successfully!`);
			username.value = "";
			email.value = "";
			password.value = "";
			passwordConfirm.value = "";
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.handleNewUserCreate(event));
		username.value = "";
		email.value = "";
		password.value = "";
		passwordConfirm.value = "";
		console.error('Could not create new user !\n => ', err);
		alertBoxMsg(`⚠️ Could not create new user!`);
		// requestResult.innerText = '⚠️ Server-side error ! Try again !';
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
		if (result) 
		{
			username.value = "";
			password.value = "";

			window.sessionStorage.setItem('logStatus','loggedIn');
			window.sessionStorage.setItem('access_token',result.token);
			console.log('⏳ Logged in !');
			alertBoxMsg(`Welcome back ${data.name} ! 😉`);
			await backToDefaultPage();
		}

	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.handleLoginClick(event));
		// logResult.innerText = '⚠️ Server side error !';
		alertBoxMsg(`⚠️ Server side error ! Try again !`);
		console.error('Login error !\n => ', err);
		username.value = "";
		password.value = "";
		
	}
};

