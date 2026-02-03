import { displayUserFriends, checkForFriendRequests, backToDefaultPage, alertBoxMsg } from "./userLog.js";

let UserSocket: WebSocket | null = null;

const interpretSocketMsg = async (socketMsgType: string): Promise<void> => {

	switch (socketMsgType) {
		case "friend_presence":
			console.info("A friend updated their log status, reloading..");
			displayUserFriends();
			break;
		case "friend:update":
			console.info("A friend was added to the list, reloading..");
			alertBoxMsg("✅ A new friend has been added to your friends list !");
			displayUserFriends();
			checkForFriendRequests();
			break;
		case "delete:update":
			console.info("A friend was deleted, reloading..");
			displayUserFriends();
			break;
		case "request:update":
			console.info("You got a new friend request !");
			checkForFriendRequests();
			break;
		case "reject:update":
			console.info("Request rejected.");
			checkForFriendRequests();
			break;
		case "user:alter":
			console.info("A friend update his profile");
			displayUserFriends();
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
		UserSocket.close(1000, 'closing socket..');
		console.info("Closed friend socket...");
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

	UserSocket.addEventListener("open", () => {
		console.info("WebSocket opened");
	});

	UserSocket.addEventListener("error", (event) =>  //socket closes on error event , no need to close it 
	{
		console.error(`Error while using websocket : ${event.type} , closing it..`);
		window.sessionStorage.setItem('socket_failed', 'true');
		window.sessionStorage.setItem('logStatus', 'loggedOut');
		window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
		backToDefaultPage();
	});

	UserSocket.addEventListener('message', (event) => {
		const index = event.data.toString().indexOf("\"type\"");
		if (index)
		{
			let socketMsg = event.data.toString()	
			let socketMsgType = socketMsg.substring(socketMsg.indexOf(":") + 2,socketMsg.indexOf(",") - 1);
			interpretSocketMsg(socketMsgType)
		}
	});

	UserSocket.addEventListener("close", (ev: CloseEvent) => {
		if (ev.code === 1008) {
			console.error('Socket closed because of invalid token : ', ev.reason);
			window.sessionStorage.setItem('socket_failed', 'true');
			window.sessionStorage.setItem('logStatus', 'loggedOut');
			window.sessionStorage.setItem('access_token', 'userSelfLogoutToken');
			backToDefaultPage();
		}
	});

	if(sessionStorage.getItem('socket_failed') && sessionStorage.getItem('socket_failed') == 'true')
	{
		sessionStorage.removeItem('socket_failed');
		return false;
	}
	return true;
};

