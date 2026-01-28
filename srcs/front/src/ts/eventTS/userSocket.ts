import { displayUserFriends, checkForFriendRequests } from "./userLog.js";

let UserSocket: WebSocket | null = null;

const interpretSocketMsg = async (socketMsgType: string): Promise<void> => {

	console.log("Interpret : ", socketMsgType);
	switch (socketMsgType) {
		case "friend_presence":
			console.log("A friend updated their log status, reloading..");
			displayUserFriends();
			break;
		case "friend:update":
			console.log("A friend was added to the list, reloading..");
			displayUserFriends();
			break;
		case "delete:update":
			console.log("A friend was deleted, reloading..");
			displayUserFriends();
			break;
		case "request:update":
			console.log("You got a new friend request !");
			checkForFriendRequests();
			break;
		case "reject:update":
			console.log("Request rejected.");
			checkForFriendRequests();
			break;
		default:
			displayUserFriends();
			checkForFriendRequests();
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

	console.info("Socket creation function created.");
	console.trace("Tracing call time.");
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

