import startingFile from "../viewTS/startingFile.js";
import { goTo2faLogin } from "./2FAEvent.js";
import { adjustNavbar } from "./index.js";
import type {
	FriendAcceptData,
	FriendRejectData,
	FriendRequestData,
	NewUserData,
} from "../types/api.types";

export const backToDefaultPage = async (): Promise<void> => {
	const view = new startingFile();
	const appElement = document.querySelector("#app") as HTMLElement | null;
	if (appElement) {
		appElement.innerHTML = await view.getHTML();
	}
	adjustNavbar("/");
	if (typeof view.init === "function") {
		await view.init();
	}
	history.pushState(null, "", "/");
}

const hideAlertBoxMsg = async (): Promise<void> => {
	const alertBox = document.getElementById('alertBox') as HTMLElement | null;
	if (!alertBox) return;

	alertBox.style.display = 'none';
	alertBox.innerHTML = "Hey ! I'm supposed to be hidden ! >:(";
}

export const displayCorrectErrMsg = async (error: Error | string): Promise<void> => {

	const index = error.toString().indexOf("\"errRef\"");
	if (index < 0)
	{
		//Not from a custom response, zod schema err instead
		// alertBoxMsg("❌ An error happened but don't worry, it's not your fault");
		const index2 = error.toString().indexOf("\"message\"");
		let errstrZod = error.toString().substring(index2);	
		let keyZod = errstrZod.substring(errstrZod.indexOf(":") + 2,errstrZod.indexOf("}") - 1);
		// alertBoxMsg(errstrZod);
		console.info("Displayed : ", keyZod);
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
		case "malformedJWT":
			alertBoxMsg(`⚠️ Unable to refresh token ! Log in again !`);
			break;
		case "tokenNoRefresh":
			alertBoxMsg(`⚠️ Token could not be refreshed, you need to log-in again before performing another action.`);
			break;
		case "userSelfLogoutToken":
			alertBoxMsg(`⚠️ You cannot perform this action while logged out !`);
			break;
		case "authenticateOtherError":
			alertBoxMsg(`⚠️ We were unable to verify your token, please log in again !`);
			break;
		case "registerNameTaken":
			alertBoxMsg(`❌ This username is already used by someone !`);
			break;
		case "registerEmailTaken":
			alertBoxMsg(`❌ This email is already used by someone !`);
			break;
		case "loginInvalidName":
			alertBoxMsg(`❌ Username does not exist !`);
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
			alertBoxMsg(`❌ The username you chose is already used !`);
			break;
		case "alterInnerFail":
			alertBoxMsg(`⚠️ Server side error ! Couldn't edit profile !`);
			break;
		case "requestUserNotFound":
			alertBoxMsg(`❌ Selected user does not exist !`);
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
		case "deleteNotFriends":
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

export const alertBoxMsg = async (msg: string): Promise<void> => {
	const alertBox = document.getElementById('alertBox') as HTMLElement | null;
	if (!alertBox) return;

	alertBox.style.display = 'inline';
	alertBox.innerHTML = msg;
	setTimeout(hideAlertBoxMsg, 3000);
}

export const fetchErrcodeHandler = async (error: Error | string): Promise<number> => {


	const isNotAuth = error.toString().search("\"errRef\":\"authBearerMissing\"") != -1;
	const isExpired = error.toString().search("\"errRef\":\"expiredJWT\"") != -1;
	const isMalformed = error.toString().search("\"errRef\":\"malformedJWT\"") != -1;
	const isSelfLogout = error.toString().search("\"errRef\":\"userSelfLogout\"") != -1;
	const tokenNoRefresh = error.toString().search("\"errRef\":\"tokenNoRefresh\"") != -1;

	if(isNotAuth || isMalformed || isSelfLogout || tokenNoRefresh)
	{
		window.sessionStorage.setItem('logStatus', 'loggedOut');
		if (isSelfLogout)
			alertBoxMsg("⚠️ You need to be logged in to perform this action !");
		else if (isNotAuth)
			alertBoxMsg("⚠️ Missing bearer token in the request ! Log in again !");
		else if (tokenNoRefresh)
			alertBoxMsg(`⚠️ Token could not be refreshed, you need to log-in again before performing another action.`);
		else
			alertBoxMsg("⚠️ Malformed JWT Token ! Log in again !");
		backToDefaultPage();
		return (-1);
	}
	else if (isExpired)
	{
		if (!(window.sessionStorage.getItem("nbReloadsLeft")))
			window.sessionStorage.setItem('nbReloadsLeft', '1');
		else
		{
			const reloadCpt = parseInt(window.sessionStorage.getItem('nbReloadsLeft') || '0');
			if (reloadCpt == 0)
			{
				window.sessionStorage.setItem('logStatus', 'loggedOut');
				console.log("No tries left ! backToDefaultPage !");
				backToDefaultPage();
				return (-1);
			}
			window.sessionStorage.setItem('nbReloadsLeft', String(reloadCpt - 1));
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
				window.sessionStorage.setItem('nbReloadsLeft', '1');
			}
			else
				throw new Error(`Token could not be generated !`);
		} 
		catch (err) 
		{
			console.error("⚠️ Could not refresh tokens ... please log back in !"); //is this enough ?
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			window.sessionStorage.setItem('access_token', 'tokenNoRefresh');
			backToDefaultPage();
			return (-1);
		}
		return (0);
	}
	return(42);
}

const fieldValidity = (
	username: HTMLInputElement | null,
	pwd: HTMLInputElement | null,
	pwdconf: HTMLInputElement | null,
	requestR: HTMLElement | null,
	email: HTMLInputElement | null
): boolean => {
	if (!requestR || !pwdconf) return false;

	requestR.innerText = "";
	if (!username || !username.value || username.value.length < 3)
	{
		requestR.innerText = "❌ Username must be at least 3 characters !";
		if (username) username.focus();
		return false;
	}
	else if (!email || !email.value)
	{
		requestR.innerText = "❌ Email cannot be empty !";
		if (email) email.focus();
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
		if (pwd) pwd.focus();
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
	if (!pwdconf.value)
	{
		requestR.innerText = "❌ You must confirm your password first!";
		pwdconf.focus();
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

export async function isUserAllowedHere(): Promise<number> {
	try {
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
		if (await fetchErrcodeHandler(err as Error) == 0)
			return (isUserAllowedHere());
		alertBoxMsg(`❌ You are not allowed to be here ! Log-in first !`);
		console.error("\n❌No valid credentials ! Back to Login page !\n");
		console.error(err);
		return (0); //no valid credentials
	}
	return(0);
}

window.acceptFriend = async (friendId: number): Promise<void> => {
	const requestList = document.getElementById('requestList') as HTMLElement | null;
	if (!requestList || !friendId) return;

	const data: FriendAcceptData = {
		friendAcceptId: friendId,
	};

	try 
	{
		const acceptFriendRequestResponse = await fetch('/friend/accept', {
				method: 'PATCH',
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
			window.grabProfileInfo();
		}
	}
	catch (err)
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return window.acceptFriend(friendId);
		console.error('⚠️ Couldn\'t accept friend request !\n =>', err);
		displayCorrectErrMsg(err as Error);
	}
}

window.rejectFriend = async (friendId: number): Promise<void> => {
	const requestList = document.getElementById('requestList') as HTMLElement | null;
	const requestLabel = document.getElementById('requestCheckLabel') as HTMLElement | null;
	const requestBlock = document.getElementById('pendingRequestBlock') as HTMLElement | null;

	if (!requestList || !requestLabel || !requestBlock || !friendId) return;

	const data: FriendRejectData = {
		friendRejectId: friendId,
	};

	try 
	{
		const rejectFriendRequestResponse = await fetch('/friend/reject', {
				method: 'DELETE',
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
				const clearName = result.rejectedName + "[42]";
				const currentElement = document.getElementsByName(clearName);
				if (currentElement && currentElement.length > 0)
				{
					const target = currentElement[0];
					target.remove();
				}
				window.grabProfileInfo();
			}
		}
	}
	catch (err)
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return window.rejectFriend(friendId);
		console.error('⚠️ Couldn\'t reject friend request !\n =>', err);
		displayCorrectErrMsg(err as Error);
	}
}

const checkForFriendRequests = async (): Promise<void> => {
	const requestList = document.getElementById('requestList') as HTMLElement | null;
	const requestLabel = document.getElementById('requestCheckLabel') as HTMLElement | null;
	const requestBlock = document.getElementById('pendingRequestBlock') as HTMLElement | null;

	if (!requestList || !requestLabel || !requestBlock) return;

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
					<button class="accept-request px-2 py-1 rounded" onclick="acceptFriend(${friendId})" title="Accept">✅</button>
					<button class="reject-request px-2 py-1 rounded" onclick="rejectFriend(${friendId})" title="Reject">❌</button>
				</span>`;
				requestList.appendChild(listItem);
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(checkForFriendRequests());
		console.error('⚠️ Couldn\'t display friend requests !\n =>', err);
	}

}

const displayUserFriends = async (): Promise<void> => {
	const friendList = document.getElementById('friendlist') as HTMLElement | null;
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
				// if (result.friends[i].online)
				// 	listItem.innerHTML = `<span class="text-sm border w-full p-2 mb-2" name="${clearName}">🟢 ${result.friends[i].name}</span>`; 
				// else
					listItem.innerHTML = `<span class="text-sm border w-full p-2 mb-2" name="${clearName}">🔴 ${result.friends[i].name}</span>`;// false now
					
				friendList.appendChild(listItem);
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(displayUserFriends());
		console.error('⚠️ Couldn\'t grab user friend info !\n => ', err);
	}

}

window.grabProfileInfo = async function (): Promise<void> {
	const profilePanel = document.getElementById('profilePanel') as HTMLElement | null;
	const profileUsername = document.getElementById('playerGrabbedUsername') as HTMLElement | null;
	const profilePicture = document.getElementById('sidePannelPfp') as HTMLElement | null;

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
		if (await fetchErrcodeHandler(err as Error) == 0)
			return (window.grabProfileInfo());
		console.error('Profile info grab failed !\n => ', err);
		return ;
	}
	displayUserFriends();
	checkForFriendRequests();
}


window.sendNewFriendRequest = async function (): Promise<void> {
	const friendReqInput = document.getElementById('friendSearchInput') as HTMLInputElement | null;
	if (!friendReqInput || !friendReqInput.value) return;

	const data: FriendRequestData = {
		friendRequestName: friendReqInput.value,
	};

	try 
	{
		const sentFriendRequestResponse = await fetch('/friend/request', {
				method: 'PATCH',
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
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.sendNewFriendRequest());
		console.error('Could not send friend request !\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
}

window.logoutUser = logoutUser;

export async function logoutUser(): Promise<void> {
	try {
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
			window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.logoutUser());
		console.error('⚠️ Couldn\'t log out user !\n => ', err);
	}
}

window.handleNewUserCreate = async function (event: Event): Promise<void> {
	event.preventDefault();

	const username = document.getElementById('newUsernameNewUser') as HTMLInputElement | null;
	const email = document.getElementById('newUserEmail') as HTMLInputElement | null;
	const password = document.getElementById('firstPasswordNewUser') as HTMLInputElement | null;
	const passwordConfirm = document.getElementById('confirmPasswordNewUser') as HTMLInputElement | null;
	const requestResult = document.getElementById('saveNewUserInfo') as HTMLElement | null;

	if (fieldValidity(username, password, passwordConfirm, requestResult, email) === false)
		return;

	const data: NewUserData = {
		email: email!.value,
		name: username!.value.toUpperCase(),
		password: password!.value,
		passwordconfirmation: passwordConfirm!.value,
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
			if (username) username.value = "";
			if (email) email.value = "";
			if (password) password.value = "";
			if (passwordConfirm) passwordConfirm.value = "";
			window.sessionStorage.setItem('logStatus','loggedIn');
			window.sessionStorage.setItem('access_token',result.token);
			alertBoxMsg(`Welcome ${data.name} ! 😉`);
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.handleNewUserCreate(event));
		// username.value = "";
		// email.value = "";
		// password.value = "";
		// passwordConfirm.value = "";
		console.error('Could not create new user !\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
};

window.handleLoginClick = async function (event: Event): Promise<void> {
	event.preventDefault();
	const username = document.getElementById('clientUsername') as HTMLInputElement | null;
	const password = document.getElementById('clientPassword') as HTMLInputElement | null;
	const logResult = document.getElementById('signInResult') as HTMLElement | null;

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

	let base64Credentials = btoa((username.value.toString() + ":" + password.value.toString()));
	try 
	{
		const loginResponse = await fetch('/login', {
				method: 'POST',
				headers: {Authorization: `Basic ${base64Credentials}`},
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
				alertBoxMsg(`Welcome back ${username.value} ! 😉`);
				await backToDefaultPage();
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.handleLoginClick(event));
		username.value = "";
		password.value = "";
		console.error('Login error !\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
};

window.updateUserPassword = async function (event: Event): Promise<void> {
	event.preventDefault();

	try {
		const oldPassword = document.getElementById('currentPasswordInput') as HTMLInputElement | null;
		const newPassword = document.getElementById('newPasswordInput') as HTMLInputElement | null;
		const confirmNewPassword = document.getElementById('confirmNewPasswordInput') as HTMLInputElement | null;
		const requestResult = document.getElementById('changePasswordResult') as HTMLElement | null;

		if (!oldPassword || !newPassword || !confirmNewPassword || !requestResult)
			return;
		requestResult.innerText = "";
		
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
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.updateUserPassword(event));
		console.error('Failed to update password!\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
}

window.loginPlayer2 = async function (event: Event): Promise<void> {
	event.preventDefault();
	const username = document.getElementById('player2UserName') as HTMLInputElement | null;
	const password = document.getElementById('player2Password') as HTMLInputElement | null;
	const logResult = document.getElementById('Player2Result') as HTMLElement | null;
	const divLogin = document.getElementById('profile2Login') as HTMLElement | null;
	const divLogin2FA = document.getElementById('profile2Login2FA') as HTMLElement | null;
	const profile2Overview = document.getElementById('profile2Overview') as HTMLElement | null;
	const player2TwoFAInput = document.getElementById('player2TwoFAInput') as HTMLInputElement | null;
	const goToGameButtonDiv = document.getElementById('goToGameButtonDiv') as HTMLElement | null;
	const Player1Name = document.getElementById('Player1Name') as HTMLElement | null;

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
	else if (Player1Name && username.value.toUpperCase() == Player1Name.innerHTML.toUpperCase())
	{
		logResult.innerText = "❌ Player 2 username cannot be the same as Player 1 !";
		username.value = "";
		password.value = "";
		username.focus();
		return;
	}

	const data = {
		name: username.value.toUpperCase(),
		password: password.value,
	};		
	try 
	{
		const loginResponse = await fetch('/login/player2', {
				method: 'POST',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
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
				if (divLogin) divLogin.style.display = "none";
				if (divLogin2FA) divLogin2FA.style.display = "flex";
				if (player2TwoFAInput) player2TwoFAInput.focus();
			}
			else
			{
				window.sessionStorage.setItem('player2_token',result.token);
				await window.loadPlayer2Data();
				console.log('⏳ Player 2 Logged in !');
				alertBoxMsg('⏳ Player 2 Logged in !');
				if (divLogin) divLogin.style.display = "none";
				if (divLogin2FA) divLogin2FA.style.display = "none";
				if (profile2Overview) profile2Overview.style.display = "flex";
				if (goToGameButtonDiv) goToGameButtonDiv.style.display = "flex";
			}
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.loginPlayer2(event));
		username.value = "";
		password.value = "";
		console.error('Login error !\n => ', err);
		displayCorrectErrMsg(err as Error);
	}
};

window.buildMatchHistoryPage = async function (): Promise<void> {
	const matchHistoryDiv = document.getElementById('matchHistoryDiv') as HTMLElement | null;

	if (!matchHistoryDiv) return;

	try 
	{
		const userHistoryRequestResponse = await fetch('/match/history', {
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
		});
	
		if (!userHistoryRequestResponse.ok) {
				const text = await userHistoryRequestResponse.text().catch(() => userHistoryRequestResponse.statusText);
				throw new Error(`Request failed: ${userHistoryRequestResponse.status} ${text}`);
		}
		const result = await userHistoryRequestResponse.json();	
		if (result)
		{
			matchHistoryDiv.innerHTML = '';
			if (result.match.length)
			{
				for(let i = 0; i < result.match.length; i++) 
				{
					var divItem = document.createElement("div");
					divItem.className = 'flex flex-col bg-[#4ac03d9f] border border-white rounded-lg w-full gap-2 p-4';
					divItem.innerHTML = `<div class="flex flex-col gap-y-2">
							<div class="flex flex-row justify-between items-center">
								<div class="flex flex-col items-start w-[40%]">
									<p>${result.match[i].createdAt}</p>
									<p>${result.match[i].duration} seconds</p>
								</div>
								<p class="w-[20%]">${result.match[i].player1Score} - ${result.match[i].player2Score}</p>
								<div class="flex flex-col items-end w-[40%]">
									<p>${result.match[i].type}</p>
									<p>${result.match[i].round}</p>
								</div>
							</div>
							<div class="flex flex-row justify-between items-center">
								<div class="flex flex-col items-start w-[50%]">
									<p>${result.match[i].player1name}</p>
								</div>
								<div class="flex flex-col items-end w-[50%]">
									<p>${result.match[i].player2name}</p>
								</div>
							</div>
						</div>`;
					if (!result.match[i].win)
						divItem.style.backgroundColor = "#c03d3d9f";
					matchHistoryDiv.appendChild(divItem);
				}
			}
		}
		
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return(window.buildMatchHistoryPage());
		console.error('⚠️ Couldn\'t recover user history!\n => ', err);
	}
}

	
window.loadProfileData = async function (): Promise<void> {
	const Player1Name = document.getElementById('Player1Name') as HTMLElement | null;
	const player1Pfp = document.getElementById('player1Pfp') as HTMLImageElement | null;

	if (!Player1Name || !player1Pfp) return;

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
			Player1Name.innerHTML = result.name;
			player1Pfp.src = result.avatar;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return (window.loadProfileData());
		console.error('Profile info grab failed !\n => ', err);
		return ;
	}
}

window.loadPlayer2Data = async function (): Promise<void> {
	const Player2Name = document.getElementById('Player2Name') as HTMLElement | null;
	const player2Pfp = document.getElementById('player2Pfp') as HTMLImageElement | null;

	if (!Player2Name || !player2Pfp) return;

	try 
	{
		const dataRequestResponse = await fetch('/profile/grab2', { //GET request by default without the "request" parameter
				headers: {Authorization: `Bearer ${sessionStorage.getItem("player2_token")}`},
				credentials: 'include',
		});
	
		if (!dataRequestResponse.ok) {
				const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
				throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
		}
		const result = await dataRequestResponse.json();	
		if (result)
		{	
			Player2Name.innerHTML = result.name;
			player2Pfp.src = result.avatar;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return (window.loadPlayer2Data());
		console.error('Profile info grab failed !\n => ', err);
		return ;
	}
}

window.handlePongModeDisplay = async function (mode: number): Promise<void> {
	const LeftPlayer = document.getElementById('LeftPlayer') as HTMLElement | null;
	const RightPlayer = document.getElementById('RightPlayer') as HTMLElement | null;
	const instruction1v1 = document.getElementById('instruction1v1') as HTMLElement | null;
	const instruction2v2 = document.getElementById('instruction2v2') as HTMLElement | null;

	if (!LeftPlayer || !RightPlayer || !instruction1v1 || !instruction2v2) return;

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
			LeftPlayer.textContent = result.name;
		}
	}
	catch (err)
	{
		if (await fetchErrcodeHandler(err as Error) == 0)
			return window.handlePongModeDisplay(mode);
		console.error('Profile info grab failed !\n => ', err);
		return ;
	}

	if (mode === 0) {
		RightPlayer.textContent = "COMPUTER";
	}
	else if (mode === 1) {
		RightPlayer.textContent = "PLAYER 2";
	}
	else if (mode === 2) {
		RightPlayer.textContent = "PLAYER 2";
		instruction1v1.style.display = "none";
		instruction2v2.style.display = "flex";
	}
	else if (mode === 3) {
		try
		{
			const dataRequestResponse = await fetch('/profile/grab2', { //GET request by default without the "request" parameter
					headers: {Authorization: `Bearer ${sessionStorage.getItem("player2_token")}`},
					credentials: 'include',
			});
		
			if (!dataRequestResponse.ok) {
					const text = await dataRequestResponse.text().catch(() => dataRequestResponse.statusText);
					throw new Error(`Request failed: ${dataRequestResponse.status} ${text}`);
			}
			const result = await dataRequestResponse.json();	
			if (result)
			{	
				RightPlayer.innerHTML = result.name;
			}
		} 
		catch (err)
		{
			if (await fetchErrcodeHandler(err as Error) == 0)
				return window.handlePongModeDisplay(mode);
			console.error('Profile info grab failed !\n => ', err);
			return ;
		}
		}
}