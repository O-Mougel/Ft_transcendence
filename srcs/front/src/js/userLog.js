import startingFile from "../views/startingFile.js";
import { goTo2faLogin } from "./2FAEvent.js";
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

export const displayCorrectErrMsg = async (error, data) => {

	const index = error.toString().indexOf("\"errRef\"");
	if (index < 0)
	{
		//Not from a custom response, zod schema err instead
		const errindex = error.toString().indexOf("\"message\"");
		alertBoxMsg("🆘 " + error.toString().substring(errindex));
		return;
	}
	let errstr = error.toString().substring(index);	
	let key = errstr.substring(errstr.indexOf(":") + 2,errstr.indexOf("}") - 1);
	// console.log("Isolated error is : (",key,")");

	switch (key) {
		case "authBearerMissing":
			alertBoxMsg(`❌ Invalid Bearer in request header !`);
			break;
		case "expiredJWT":
			alertBoxMsg(`⚠️ JWT token expired or is invalid !`);
			break;
		case "registerNameTaken":
			alertBoxMsg(`❌ This username is already used by someone !`);
			break;
		case "registerEmailTaken":
			alertBoxMsg(`❌ This email is already used by someone !`);
			break;
		case "loginInvalidName":
			alertBoxMsg(`❌ Username is incorrect !`);
			break;
		case "loginInvalidPwd":
			alertBoxMsg(`❌ Incorrect password !`);
			break;
		case "NotAuthUser":
			alertBoxMsg(`⚠️ Invalid credentials !`);
			break;
		case "alterUserNotFound":
			alertBoxMsg(`⚠️ Server-side issue, failed to grab your current profile !`);
			break;
		case "alterPwdIncorrect":
			alertBoxMsg(`⚠️ Invalid credentials !`);
			break;
		case "alterUsernameTaken":
			alertBoxMsg(`❌ Username \"${data}\" is already used !`);
			break;
		case "alterInnerFail":
			alertBoxMsg(`⚠️ Server side error ! Couldn't edit profile !`);
			break;
		case "requestUserNotFound":
			alertBoxMsg(`❌ User \"${data}\" does not exist !`);
			break;
		case "requestSelfFriend":
			alertBoxMsg(` Cannot ask yourself as a friend !`);
			break;
		case "requestStillPending":
			alertBoxMsg(`⚠️ You already sent a friend request to this user !`);
			break;
		case "requestAlreadyFriend":
			alertBoxMsg(`⚠️ You are already friends with this user !`);
			break;
		case "requestDuplicate":
			alertBoxMsg(`⚠️ User already sent you a request ! Accept it !`);
			break;
		case "verify2FANotSetUp":
			alertBoxMsg(`❌ 2FA is not set for this user yet !`);
			break;
		case "verifyInvalidCode":
			alertBoxMsg(`❌ 2FA verification code was invalid !`);
			break;
		case "loginMatchUserNotFound":
			alertBoxMsg(`❌ User does not exist !`);
			break;
		case "loginMatchInvalidPwd":
			alertBoxMsg(`❌ Invalid password for player 2!`);
			break;
		case "2FAIsAlreadyUp":
			alertBoxMsg(`⚠️ 2FA is already enabled!`);
			break;
		case "2FAIsAlreadyDisabled":
			alertBoxMsg(`⚠️ 2FA is already disabled!`);
			break;
		case "editPasswordInnerFail":
			alertBoxMsg(`⚠️ ID sent doesn't match any user in the database !`);
			break;
		case "editPwdIncorrectCredentials":
			alertBoxMsg(`❌ Password is invalid ! Try again !`);
			break;
		case "requestCantAccept":
			alertBoxMsg(`❌ Invalid friend request ! Cannot accept !`);
			break;
		case "deteteNotFriends":
			alertBoxMsg(`❌ Selected user is not your friend !`);
			break;
		case "uploadNotMultipart":
			alertBoxMsg(`❌ Request was not in multipart format !`);
			break;
		case "uploadEmptyFileField":
			alertBoxMsg(`❌ File field cannot be empty !`);
			break;
		case "uploadEmptyMimeName":
			alertBoxMsg(`❌ Mime and filename fields cannot be empty !`);
			break;
		case "uploadNameTooShort":
			alertBoxMsg(`❌ Filename must be at least 1 character !`);
			break;
		case "uploadWrongFiletype":
			alertBoxMsg(`❌ Only images can be uploaded !`);
			break;
		case "uploadFailedWrite":
			alertBoxMsg(`❌ File couldn't be written on server !`);
			break;
		default:
			alertBoxMsg(`⚠️ Server side error ! Try again !`);
			break;
	}

}

export const alertBoxMsg = async (msg) => {
		
	const alertBox = document.getElementById('alertBox');
	if (!alertBox) return;

	alertBox.style.display = 'inline';
	alertBox.innerHTML = msg;
	setTimeout(hideAlertBoxMsg, 3000);
}

export const fetchErrcodeHandler = async (error) => {

	const isNotAuth = error.toString().search("\"errRef\":\"authBearerMissing\"") != -1;
	const isExpired = error.toString().search("\"errRef\":\"expiredJWT\"") != -1;
	// console.log("[DEBUG] fetchErrcode handle ...", isExpired, isNotAuth);
	if(isNotAuth || (window.sessionStorage.getItem("logStatus")) == 'loggedOut')
	{
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
				console.log("No tries left ! backToDefaultPage !");
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
					method:'POST'
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
				window.sessionStorage.setItem('nbReloadsLeft', 1);
			}
			else
				throw new Error(`Token could not be generated !`);
		} 
		catch (err) 
		{
			console.error("⚠️ Could not refresh tokens ... please log back in !"); //is this enough ?
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			window.sessionStorage.setItem('access_token', 'NotValid');
			backToDefaultPage();
			return (-1);
		}
		return (0);
	}
	return(42);
}

const fieldValidity = (username, pwd, pwdconf, requestR, email) => {

	if(!requestR) return false;
	requestR.innerText = "";
	if (!username || !username.value || username.value.length < 3)
	{
		requestR.innerText = "❌ Username must be at least 3 characters !";
		username.focus();
		return false;
	}
	else if (!email || !email.value)
	{
		requestR.innerText = "❌ Email cannot be empty !";
		email.focus();
		return false;
	}
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
	{
		requestR.innerText = "❌ Email format is invalid !";
		email.focus();
		return false;
	}
	else if (!pwd || !pwd.value || pwd.value.length < 8)
	{
		requestR.innerText = "❌ Password must be at least 8 characters long !";
		pwd.focus();
		return false;
	}
	else if (pwd.value.length > 32)
	{
		requestR.innerText = "❌ Password must be less than 32 characters long !";
		pwd.focus();
		pwd.value = '';
		pwdconf.value = '';
		return false;
	}
	else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd.value))
	{
		requestR.innerText = "❌ Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character !";
		pwd.focus();
		return false;
	}
	if (!pwdconf || (pwd.value != pwdconf.value))
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
	if(!requestList || !username) return;

	const data = {
		friendAcceptId: username,
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
				let	clearName = result.friendname + "[42]";
				const currentElement = document.getElementsByName(clearName);
				if (currentElement && currentElement.length > 0)
				{
					const target = currentElement[0];
					target.remove();
				}
			}
			alertBoxMsg(`✅ You are now friend with \"${result.friendname} !\"`);
			grabProfileInfo();
		}
	}
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.acceptFriend(username));
		console.error('⚠️ Couldn\'t accept friend request !\n =>', err);
		displayCorrectErrMsg(err, data.friendrejectname);
	}
}

window.rejectFriend = async (username) => {
	const requestList = document.getElementById('requestList'); //contains the requests
	const requestLabel = document.getElementById('requestCheckLabel');
	const requestBlock = document.getElementById('pendingRequestBlock');

	if(!requestList || !requestLabel || !requestBlock || !username) return;

	const data = {
		friendRejectId: username,
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
		displayCorrectErrMsg(err, data.friendrejectname);
	}
}

const checkForFriendRequests = async () => {
	
	const requestList = document.getElementById('requestList'); //contains the requests
	const requestLabel = document.getElementById('requestCheckLabel'); //contains the requests
	const requestBlock = document.getElementById('pendingRequestBlock'); //contains the requests

	if(!requestList || !requestLabel || !requestBlock) return;

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
				let	friendId = result.requestOf[i].id;
				listItem.className = 'py-2 flex items-center justify-between ml-5';
				listItem.setAttribute('name', clearName);
				const jsonString = JSON.stringify(result.requestOf[i].name);
				const safeName = jsonString.replace(/['"]+/g, '');
				// console.log("Safe name is : ", safeName);
				// console.log(" name is : ", result.requestOf[i].name);
				listItem.innerHTML = `
				<span class="text-sm">↪ ${safeName}</span>
				<span class="flex items-center gap-2">
					<button class="accept-request px-2 py-1 rounded" onclick="acceptFriend('${friendId}')" title="Accept">✅</button>
					<button class="reject-request px-2 py-1 rounded" onclick="rejectFriend('${friendId}')" title="Reject">❌</button>
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
	if (!friendList) return;
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

	if (!profilePanel || !profileUsername || !profilePicture) return;

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
			profileUsername.innerHTML = "<u>" + result.name + "</u>";
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
		return ;
	}
	displayUserFriends();
	checkForFriendRequests();
}


window.sendNewFriendRequest = async function () {

	const friendReqInput = document.getElementById('friendSearchInput');
	if (!friendReqInput || !friendReqInput.value) return ; //if field empty do nothing

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
			friendReqInput.value = "";
			console.log('✅ Sent friend request');
			alertBoxMsg(`✅ Friend request sent to \"${data.friendRequestName}\"`);
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.sendNewFriendRequest());
		console.error('Could not send friend request !\n => ', err);
		displayCorrectErrMsg(err, data.friendRequestName);
	}
}

window.logoutUser = logoutUser;

export async function logoutUser() {

	try 
	{
		const logoutResponse = await fetch('/logout', {
				method: 'POST',
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
		name: username.value.toUpperCase(),
		password: password.value,
		passwordconfirmation: passwordConfirm.value,
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
			window.sessionStorage.setItem('logStatus','loggedIn');
			window.sessionStorage.setItem('access_token',result.token);
			alertBoxMsg(`Welcome ${data.name} ! 😉`);
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
		displayCorrectErrMsg(err, "dummydata");
	}
};

window.handleLoginClick = async function (event) {

	event.preventDefault();
	const username = document.getElementById('clientUsername');
	const password = document.getElementById('clientPassword');
	const logResult = document.getElementById('signInResult');

	if (!username || !password || !logResult) return;

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
		// name: username.value.toUpperCase(),
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
			
			if (result.require2fa == true)
			{
				window.sessionStorage.setItem('temp_token',result.token);
				console.log('⏳ 2FA required, redirecting ...');
				await goTo2faLogin();
			}
			else
			{
				window.sessionStorage.setItem('logStatus','loggedIn');
				window.sessionStorage.setItem('access_token',result.token);
				console.log('⏳ Logged in !');
				alertBoxMsg(`Welcome back ${data.name} ! 😉`);
				await backToDefaultPage();
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.handleLoginClick(event));
		username.value = "";
		password.value = "";
		console.error('Login error !\n => ', err);
		displayCorrectErrMsg(err, "dummydata");
	}
};

window.updateUserPassword = async function (event) {
	
	event.preventDefault();

	try
	{
		const oldPassword = document.getElementById('currentPasswordInput');
		const newPassword = document.getElementById('newPasswordInput');
		const confirmNewPassword = document.getElementById('confirmNewPasswordInput');
		const requestResult = document.getElementById('changePasswordResult');
		
		requestResult.innerText = "";
		if (!oldPassword || !newPassword || !confirmNewPassword)
			return ;

		if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value)
		{
			requestResult.innerText = "❌ Passwords fields cannot be empty !";
			return ;
		}
		if (!newPassword || !newPassword.value || newPassword.value.length < 8)
		{
			requestResult.innerText = "❌ Password must be at least 8 characters long !";
			newPassword.focus();
			newPassword.value = '';
			confirmNewPassword.value = '';
			return ;
		}
		else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword.value))
		{
			requestResult.innerText = "❌ Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character !";
			newPassword.focus();
			newPassword.value = '';
			confirmNewPassword.value = '';
			return ;
		}
		if (newPassword.value !== confirmNewPassword.value)
		{
			requestResult.innerText = "❌ New passwords do not match !";
			newPassword.value = '';
			confirmNewPassword.value = '';
			newPassword.focus();
			return ;
		}

		const data = {
			oldpassword: oldPassword.value,
			newpassword: newPassword.value,
			newpasswordconfirmation: confirmNewPassword.value,
		};

		const updateUserPasswordResponse = await fetch('/profile/password', {
				credentials: 'include',
				method: 'PATCH',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				body:  JSON.stringify(data),
		});

		if (!updateUserPasswordResponse.ok) {
				const text = await updateUserPasswordResponse.text().catch(() => updateUserPasswordResponse.statusText);
				throw new Error(`Request failed: ${updateUserPasswordResponse.status} ${text}`);
		}
		const result = await updateUserPasswordResponse.json();	
		if (result)
		{			
			console.log('✅ Password updated !');
			alertBoxMsg(`✅ Password updated successfully !`);
			await backToDefaultPage();
		}
	} 
	catch (err)
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.updateUserPassword(event));
		console.error('Failed to update password!\n => ', err);
		displayCorrectErrMsg(err, "dummydata");
	}
}