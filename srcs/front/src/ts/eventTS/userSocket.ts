import { displayUserFriends } from "./userLog.js";
// import type { FileUploadResponse, ProfileEditData } from "../types/api.types.js";


let UserSocket: WebSocket | null = null;

const interpretSocketMsg = async (socketMsgType: string): Promise<void> => {

	switch (socketMsgType) {
		case "friend_presence":
			console.log("A friend updated their log status, reloading..")
			displayUserFriends();
	// checkForFriendRequests();
			break;
	
		default:
			break;
	}
}

export const closeSocketCommunication = async (): Promise<void> => {
	if (UserSocket)
	{
		UserSocket.close();
		console.info("Closed socket...");
	}
}

export const setupSocketCommunication = async (): Promise<boolean> => {

	const userToken = window.sessionStorage.getItem('access_token'); //JSON.stringify
	if (!userToken) // no token
		return false;


	//close open socket if any
	if (UserSocket && UserSocket.readyState == WebSocket.OPEN) {
		console.info("A socket was already open, closing..");
		UserSocket.close(1000, 'closed last open socket');
	}
	
	const Usedprotocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
	const WebSocketUrlWithToken = `${Usedprotocol}//${location.host}/ws/presence?token=${encodeURIComponent(userToken)}`;
	UserSocket = new WebSocket(WebSocketUrlWithToken);

	UserSocket.addEventListener('message', (event) => {
		console.log(`Received message: ${event.data}`);
		const index = event.data.toString().indexOf("\"type\"");
		if (index)
		{
			let socketMsg = event.data.toString()	
			let socketMsgType = socketMsg.substring(socketMsg.indexOf(":") + 2,socketMsg.indexOf(",") - 1);
			interpretSocketMsg(socketMsgType)
		}
	});

	return true;
};

