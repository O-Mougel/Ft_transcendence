import { logoutUser } from "./userLog.js";

document.addEventListener("DOMContentLoaded", () => {

	if(isPageReload() && sessionStorage.getItem("logStatus") == "loggedIn")
	{
		console.info("🗘 Page was reloaded by user ...");
		logoutUser();
	}

	document.addEventListener("click", element => {
		if (element.target.matches('#profileButton') || element.target.matches('#profileButton2'))
		{
			const panel = document.getElementById('profilePanel');
			if (panel)
				panel.classList.toggle('hidden');
		}
	})
});

function reportWindowSize() {
	const panel = document.getElementById('profilePanel');
	if (!panel) return;
	var style = window.getComputedStyle(panel);
    if (style.display === 'none')
		return;
	panel.classList.toggle('hidden');
}

window.addEventListener("resize", reportWindowSize);

window.addEventListener("pagehide", () => {

	if(isPageReload() && sessionStorage.getItem("logStatus") == "loggedIn")
	{
		return ;
	}
	try 
	{
		fetch('/logout', {
				method: 'DELETE',
				credentials: 'include',
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

	const nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
	if (nav && nav.length) {
		return nav[0].type === 'reload';
	}
	return false;
}

async function uploadFileToServer(fileObj) {

	//fileObj = fileInput.files[0]
	const fileInput = document.getElementById('myfileSelector');
	const filenameStr = document.getElementById('selectedFileName');

	const formData = new FormData();
	formData.append("myfileSelector", fileObj);

	try 
	{
		const fileUploadFetchResponse = await fetch('/file_upload', {
				method: 'POST',
				credentials: 'include',
				body: formData,
		});
	
		if (!fileUploadFetchResponse.ok) {
				const text = await fileUploadFetchResponse.text().catch(() => fileUploadFetchResponse.statusText);
				throw new Error(`Request failed: ${fileUploadFetchResponse.status} ${text}`);
		}
		const result = await fileUploadFetchResponse.json();	
		if (result)
		{
			// filenameStr.innerText = "✅ File uploaded";
			console.log("Upload fetch success ✅");
			// console.log("Pic uploaded at :", result.path);
			return result.path;
		}
	} 
	catch (err) 
	{
		console.error('File upload failed !\n => ', err);
		filenameStr.innerText = "❌ File upload failed";
		return null;
	}

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
			confirmText.innerText = '⚠️ Error: Upload error';
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
				headers: { 'Content-Type': 'application/json' },
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
			confirmText.style.color = "#3ec745";
			confirmText.innerText = "✅ User updated !";
			
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
		username.value = "";
		password.value = "";
		fileInput.value = "";
		document.getElementById('selectedFileName').textContent = '';
		console.error('Edit user error ! ', err);
		confirmText.innerText = '⚠️ Error: Network error';
	}	
};
