
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

window.grabLogInfo = function () {

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
		
};

window.onFileSelected = function (inputFileSelector) {

	const file = inputFileSelector.files && inputFileSelector.files[0];
	
	if (file)
	{
		document.getElementById('selectedFileName').textContent = file.name;
	}
	else
		document.getElementById('selectedFileName').textContent = '';
};

window.saveProfileInfo = function () {

	const username = document.getElementById('newUsername');
	const password = document.getElementById('confirmPassword');
	const confirmText = document.getElementById('confirmChangeResults');
	const fileInput = document.getElementById("myfileSelector");
	const selFile = fileInput.files[0];

	confirmText.innerText = "";

	if (!username.value && !selFile)
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
	}
	if (!password.value)
	{
		confirmText.style.color = "#e85b51";
		confirmText.innerText = "❌ Confirm your password !";
		password.focus();
		return ;
	}
	if (selFile)
	{
		console.log("Handle files...");
		console.log(selFile.name);
	}

	confirmText.style.color = "#3ec745";
	confirmText.innerText = "✅ User updated !";
	username.value = "";
	password.value = "";
	document.getElementById('selectedFileName').textContent = '';
};
