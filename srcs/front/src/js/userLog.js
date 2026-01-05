import startingFile from "../views/startingFile.js";
import loginFile from "../views/login.js";
import { adjustNavbar } from "./index.js";

const backToDefaultPage = async () => {

	const view = new startingFile();
	document.querySelector("#app").innerHTML = await view.getHTML();
	adjustNavbar("/");
	if (typeof view.init === "function") {
		 await view.init();
	}
	history.pushState(null, null, "/");
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
				headers: { 'Content-Type': 'application/json' },
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
			grabProfileInfo();
		}
	}
	catch (err) 
	{
		console.error('Internal error, could not accept friend request !\n =>', err);
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
				headers: { 'Content-Type': 'application/json' },
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
				
				// var count = requestList.childElementCount;
				// console.log("Pending request count :", count); // to checkkk
				// if (count == 0)
				// {
				// 	requestBlock.style.display = "none"; // to check later, might not work
				// }
				// else
				// 	requestLabel.innerHTML = "► Requests(" + count + ")"
				}
				grabProfileInfo();
			}
		}
	}
	catch (err) 
	{
		console.error('Internal error, could not reject friend request !\n =>', err);
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
				requestLabel.innerHTML = "► Requests(" + result.requestOf.length + ")"
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
				listItem.className = 'py-2 flex items-center justify-between';
				listItem.setAttribute('name', clearName);
				const jsonString = JSON.stringify(result.requestOf[i].name);
				const safeName = jsonString.replace(/['"]+/g, '');
				// console.log("Safe name is : ", safeName);
				// console.log(" name is : ", result.requestOf[i].name);
				listItem.innerHTML = `
				<span class="text-sm text-amber-400">✦ ${safeName}</span>
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
		console.error('Pending requests info grab failed !\n =>', err);
	}

}

const displayUserFriends = async () => {
	
	const friendList = document.getElementById('friendlist');

	try 
	{
		const friendInfoResponse = await fetch('/friend', {
				credentials: 'include',
		});
	
		if (!friendInfoResponse.ok) {
				const text = await friendInfoResponse.text().catch(() => friendInfoResponse.statusText);
				throw new Error(`Request failed: ${friendInfoResponse.status} ${text}`);
		}
		const result = await friendInfoResponse.json();	
		if (result)
		{	
			// console.log("friendlistGrab requests: ",result.friends);
			friendList.innerHTML = '';
			for(let i = 0; i < result.friends.length; i++) 
			{
				var listItem = document.createElement("li");
				let	clearName = result.friends[i].name + "[4242]";
				listItem.className = 'py-2 flex items-center justify-between';
				listItem.innerHTML = `
				<span class="text-sm text-amber-400" name="${clearName}">✦ ${result.friends[i].name}</span>`;
				friendList.appendChild(listItem);
			}
		}
	} 
	catch (err) 
	{
		console.error('Friend info grab failed !\n => ', err);
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
			// profilePicture.style.backgroundImage = `url(${result.avatar})`;
		}
	} 
	catch (err) 
	{
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
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
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
			friendReqResultText.innerHTML='✅ Sent friend request';
		}
	} 
	catch (err) 
	{
		console.error('Friend request sending error !\n => ', err);
		friendReqResultText.innerHTML='⚠️ Error !';
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
		if (result && result.message) 
		{
			console.log('⏳ Logging out ...');
			window.sessionStorage.setItem('logStatus', 'loggedOut');

			// var isLogged = sessionStorage.getItem("logStatus");
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		console.error('Login error !\n => ', err);
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
	
		if (result && result.message) 
			requestResult.innerText = result.message;
		else
		{
			console.log('✅ User created');
			username.value = "";
			email.value = "";
			password.value = "";
			passwordConfirm.value = "";
			backToDefaultPage();
		}
	} 
	catch (err) 
	{
		username.value = "";
		email.value = "";
		password.value = "";
		passwordConfirm.value = "";
		console.error('Login error !\n => ', err);
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
		if (result && result.message) 
			logResult.innerText = result.message;
		else
		{
			username.value = "";
			password.value = "";

			window.sessionStorage.setItem('logStatus','loggedIn');
			console.log('⏳ Logged in !');
			backToDefaultPage();
		}

	} 
	catch (err) 
	{
		console.error('Login error !\n => ', err);
		logResult.innerText = '⚠️ Error: Network error';
		username.value = "";
		password.value = "";
	}
};

