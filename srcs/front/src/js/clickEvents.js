import { logoutUser } from "./userLog.js";
import { backToDefaultPage } from "./userLog.js";
import { fetchErrcodeHandler } from "./userLog.js";
import { alertBoxMsg } from "./userLog.js";
import { displayCorrectErrMsg } from "./userLog.js";

document.addEventListener("DOMContentLoaded", () => {

	document.addEventListener("click", element => {
		if (element.target.matches('#profileButton') || element.target.matches('#profileButton2'))
		{
			const panel = document.getElementById('profilePanel');
			if(!panel) return;

			if (panel.style.display == "none")
				panel.style.display = "flex";
			else
				panel.style.display = "none"
		}
	})
});

function reportWindowSize() {
	const panel = document.getElementById('profilePanel');
	if (!panel) return;
	var style = window.getComputedStyle(panel);
	if (style.display === 'none')
		return;
	panel.style.display = 'none';
}

window.addEventListener("resize", reportWindowSize);

window.addEventListener('keydown', (e) => { //check if we pressed f5 or ctrl+r (or ctrl+F5)
	try 
	{
		const key = e.key || '';
		if (key === 'F5' || ((key.toLowerCase() === 'r') && (e.ctrlKey || e.metaKey)) || ((key.toLowerCase() === 'F5') && (e.ctrlKey || e.metaKey))) {
		sessionStorage.setItem('f5WasPressed', 'true');
		}
	} catch (err) {}
});

window.addEventListener("pagehide", () => {

	const	checkKeyReload = sessionStorage.getItem('f5WasPressed') === 'true';
	const	reloadTypeResult = isPageReload();

	if(checkKeyReload || reloadTypeResult)
	{
		backToDefaultPage();
		return ;
	}
	window.sessionStorage.setItem('pagehide', 'logout_fetch_sent');
	try 
	{
		fetch('/logout', {
				method: 'DELETE',
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				keepalive: true,
		});
		window.sessionStorage.setItem('logStatus', 'loggedOut');
	} 
	catch (err) 
	{
		//ignore for now
	}
 })

window.onFileSelected = function (inputFileSelector) {

	const file = inputFileSelector.files && inputFileSelector.files[0];
	
	if (file)
	{
		document.getElementById('selectedFileName').textContent = file.name;
	}
	else
		document.getElementById('selectedFileName').textContent = '';
};

function isPageReload() {

	try {
		const entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
		if (entries && entries.length && entries[0].type === 'reload')
			return true;
	}
	catch (e) {}
	return false;
}

async function uploadFileToServer(fileObj) {

	const fileInput = document.getElementById('myfileSelector');
	const filenameStr = document.getElementById('selectedFileName');
	if (!fileInput) return null;
	const formData = new FormData();
	formData.append("myfileSelector", fileObj);

	try 
	{
		const fileUploadFetchResponse = await fetch('/file_upload', {
				method: 'POST',
				credentials: 'include',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`},
				body: formData,
		});
	
		if (!fileUploadFetchResponse.ok) {
				const text = await fileUploadFetchResponse.text().catch(() => fileUploadFetchResponse.statusText);
				throw new Error(`Request failed: ${fileUploadFetchResponse.status} ${text}`);
		}
		const result = await fileUploadFetchResponse.json();	
		if (result)
		{
			console.log("Upload fetch success ✅");
			return result.path;
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return (await uploadFileToServer(fileObj));
		else
		{
			console.error('File upload failed !\n => ', err);
			filenameStr.innerText = "❌ File upload failed";
			return null;
		}
	}

}

window.spinMeAround =  function () {

	const deathStarImg = document.getElementById('deathStarImg');

	if (!deathStarImg) return;

	if(deathStarImg.classList.contains("animate-spin"))
		deathStarImg.classList.remove("animate-spin");
	else
		deathStarImg.classList.add("animate-spin");

}

window.saveProfileInfo = async function () {

	const username = document.getElementById('newUsername');
	const password = document.getElementById('confirmPassword');
	const confirmText = document.getElementById('confirmChangeResults');
	const fileInput = document.getElementById("myfileSelector");
	const selectedFile = fileInput.files[0];

	confirmText.innerText = "";

	if (!username.value && !selectedFile) // if nothing changed, do nothing
		return ;
	if (username)
	{
		if (username.value.length > 12)
		{
			confirmText.style.color = "#e85b51";
			confirmText.innerText = "❌ New username is too long ! (12 max)";
			username.value = "";
			password.value = "";
			username.focus();
			return ;
		}
		if (username.value == username.placeholder)
		{
			confirmText.style.color = "#e85b51";
			confirmText.innerText = "❌ New username cannot be the same as the old one !";
			username.value = "";
			password.value = "";
			username.focus();
			return ;
		}
	}
	if (!password.value)
	{
		confirmText.style.color = "#e85b51";
		confirmText.innerText = "❌ Confirm your password !";
		password.focus();
		return ;
	}

	var fullFilename = document.getElementById('userPfp').getAttribute("src");

	if (selectedFile && selectedFile.name)
	{
		const uploadPath = await uploadFileToServer(selectedFile);
		if (uploadPath)
			fullFilename = uploadPath;
		else
		{
			username.value = "";
			password.value = "";
			fileInput.value = "";
			document.getElementById('selectedFileName').textContent = '';
			alertBoxMsg(`❌ File could not be uploaded !`);
			return ;
		}
	}
	if (!username.value)
		username.value = username.placeholder;

	const data = {
		name: username.value,
		password: password.value,
		avatar: fullFilename,
	};

	try 
	{
		const applyChangeResponse = await fetch('/profile/edit', {
				method: 'POST',
				headers: {Authorization: `Bearer ${sessionStorage.getItem("access_token")}`, 'Content-Type': 'application/json'},
				credentials: 'include',
				body: JSON.stringify(data),
		});
	
		if (!applyChangeResponse.ok) {
				const text = await applyChangeResponse.text().catch(() => applyChangeResponse.statusText);
				throw new Error(`Request failed: ${applyChangeResponse.status} ${text}`);
		}
		const result = await applyChangeResponse.json();
	
		if (result)
		{
			alertBoxMsg(`✅ User was updated !`);
			document.getElementById('selectedFileName').textContent = '';
			fileInput.value = "";
			username.placeholder = username.value;
			document.getElementById('userPfp').setAttribute('src', fullFilename);
			username.value = "";
			password.value = "";
		}
	} 
	catch (err) 
	{
		if (await fetchErrcodeHandler(err) == 0)
			return(window.saveProfileInfo());
		username.value = "";
		password.value = "";
		fileInput.value = "";
		document.getElementById('selectedFileName').textContent = '';
		console.error('⚠️ Could not edit user info!\n', err);
		displayCorrectErrMsg(err, data.name);
	}	
};
