window.showQRCode = function (event) {
	event.preventDefault();

	console.log("Show QR code clicked");
};

window.disable2FA = async function () {
	try 
	{
		const disable2FARequestResponse = await fetch('/profile/2fa/deactivate', {
				credentials: 'include',
				method: 'DELETE',
		});

		if (!disable2FARequestResponse.ok) {
				const text = await disable2FARequestResponse.text().catch(() => disable2FARequestResponse.statusText);
				throw new Error(`Request failed: ${disable2FARequestResponse.status} ${text}`);
		}
		const result = await disable2FARequestResponse.json();	
		if (result)
		{
			console.log("2FA disabled successfully!", result);
		}
	} 
	catch (err) 
	{
		console.error('Failed to disable 2FA!\n => ', err);
	}
}