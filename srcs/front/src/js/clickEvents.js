
document.addEventListener("DOMContentLoaded", () => {
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


window.onFileSelected = function (inputFileSelector) {

	const file = inputFileSelector.files && inputFileSelector.files[0];
	
	if (file)
	{
		document.getElementById('selectedFileName').textContent = file.name;
	}
	else
		document.getElementById('selectedFileName').textContent = '';
};

function uploadFileToServer(fileObj) {

	//fileObj = fileInput.files[0]
	const fileInput = document.getElementById('myfileSelector');
	const filenameStr = document.getElementById('selectedFileName');

	const formData = new FormData();
	formData.append("myfileSelector", fileObj);
	fetch("/file_upload", {
	method: "POST",
	body: formData
	})
	.then(response => {
	return response.text().then(text => {
	if (response.ok) {
	filenameStr.innerText = "✅ File uploaded";
	} else {
	filenameStr.innerText = "❌ File upload failed";
	}
	fileInput.value = "";
	});
	})
	.catch(error => {
	filenameStr.innerText = "❌ Network Error : " + error;
	});

}

window.saveProfileInfo = async function () {

	const username = document.getElementById('newUsername');
	const password = document.getElementById('confirmPassword');
	const confirmText = document.getElementById('confirmChangeResults');
	const fileInput = document.getElementById("myfileSelector");
	const selectedFile = fileInput.files[0];

	confirmText.innerText = "";

	if (!username.value && !selectedFile) // if nothing changed, do nothing
	{
		// console.log('img src',document.getElementById('userPfp').getAttribute("src"));
		// console.log('placeholder is : ', username.placeholder);
		return ;
	}
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
	}
	if (!password.value)
	{
		confirmText.style.color = "#e85b51";
		confirmText.innerText = "❌ Confirm your password !";
		password.focus();
		return ;
	}
	if (selectedFile && selectedFile.name)
	{
		console.log(selectedFile.name);
		var fullFilename = "src/img/userPfp/" + selectedFile.name;
		// uploadFileToServer(selectedFile);
	}
	else if (!selectedFile)
	{
		var fullFilename = document.getElementById('userPfp').getAttribute("src");
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
	
		if (result && result.message) 
			confirmText.innerText = result.message;
		else
		{
			confirmText.style.color = "#3ec745";
			confirmText.innerText = "✅ User updated !";
			
			document.getElementById('selectedFileName').textContent = '';
			username.placeholder = username.value;
			document.getElementById('userPfp').setAttribute('src', fullFilename);
			username.value = "";
			password.value = "";
		}
	} 
	catch (err) 
	{
		console.error('Edit user error ! ', err);
		confirmText.innerText = '⚠️ Error: Network error';
	}	
};
