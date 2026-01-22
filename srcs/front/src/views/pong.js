import ViewTemplate from "./ViewTemplate.js";
import { CONTEXT } from "../../game/context.js";
export default class extends ViewTemplate {
    constructor() {
        super();
        this.setTitle("Select Modes");
    }
    async getHTML() {
        return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold mx-4 mb-10 text-2xl ">[username]</h1>
					<a href="/profileStats" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl mb-8 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl cursor-pointer py-2 mb-10 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left animate-slide-fade-up" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-8 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl cursor-pointer mt-10 px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left animate-slide-fade-up"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-[85%] max-w-60">
							<div class="flex items-center py-2 w-full mt-5">
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-8 px-2 rounded-l-md border border-white bg-transparent focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="h-full flex w-full justify-center">
				<div class="pt-5 flex flex-col gap-4 items-center">
					<canvas id="canvas" class="border-4 rounded-[2%] border-[#98c6f8] w-[64dvw] aspect-16/10"></canvas>
					<div id="GameOver" class="hidden absolute border-4 rounded-[10%] border-[#98c6f8] justify-center items-center p-4 mt-4">
						<div class="flex items-center">
							<span>Game Over</span>
						</div>
						<div class="flex justify-center items-center">					
							<span id="GameOverScore">0 - 0</span>
						</div>
					</div>
					<div class="flex justify-between w-full">
						<div class="flex flex-col items-start justify-start text-blue-300">
							<span id="LeftPlayer"> </span>
						</div>
						<div class="flex flex-col items-end justify-end text-red-300">
							<span id="RightPlayer"> </span>
						</div>
					</div>
					<button id="startButton" class="px-6 py-3 bg-[#98c6f8] font-bold rounded-lg hover:bg-[#7aaedc]">Start Game</button>
					
					<div id="instruction1v1" class="flex flex-col justify-center w-full border border-dashed border-white rounded-lg p-4 pb-8">
						<span class="pb-4">Controls</span>
						<div class="flex justify-between w-full">
							<div class="flex flex-col items-center justify-start w-[25%] text-blue-300">
								<span>W</span>
								<span>S</span>
							</div>
							<div class="flex flex-col items-center justify-start w-[50%]">
								<span>move up</span>
								<span>move down</span>
							</div>
							<div class="flex flex-col items-center justify-start w-[25%] text-red-300">
								<span>🢁</span>
								<span>🢃</span>
							</div>
						</div>
					</div>

					<div id="instruction2v2" class="hidden flex-col justify-center w-full border border-dashed border-white rounded-lg p-4 pb-8">
						<span class="pb-4">Controls</span>
						<div class="flex justify-between w-full">
							<div class="flex flex-col items-center justify-start w-[25%] text-blue-300">
								<div class="flex justify-around w-full">
									<span>W</span>
									<span>O</span>
								</div>
								<div class="flex justify-around w-full">
									<span>S</span>
									<span>L</span>
								</div>
							</div>
							<div class="flex flex-col justify-between w-[50%]">
								<span>move up</span>
								<span>move down</span>
							</div>
							<div class="flex flex-col items-center justify-start w-[25%] text-red-300">
								<div class="flex justify-around w-full">
									<span>🢁</span>
									<span>6</span>
								</div>
								<div class="flex justify-around w-full">
									<span>🢃</span>
									<span>3</span>
								</div>
							</div>
						</div>
					</div>

					<a id="backToTournament" class="hidden px-6 py-3 bg-transparent border border-[#98c6f8] font-bold rounded-lg hover:bg-white/10 cursor-pointer">Back to tournament</a>
					<!-- Score row under the canvas -->
					<div id="Scores" class="justify-center items-center font-bold hidden">
						<div class="flex items-center">
							<span>Left</span>
							<h3 class="p-4" id="LeftScore" value="0">0</h3>
						</div>
						<span></span>
						<div class="flex items-center">
							<h3 class="p-4" id="RightScore" value="0">0</h3>
							<span>Right</span>
						</div>
					</div>
				</div>
			</div>`;
    }
    async init() {
        const mode = (location.pathname === '/pongAI') ? 0 : (location.pathname === '/pongRanked') ? 3 : (location.pathname === '/pong2') ? 2 : 1;
        const module = await import("/game/pong.js");
        if (typeof module.initPong === "function")
            module.initPong({ mode, gameId: CONTEXT.gameId });
        handlePongModeDisplay(mode);
    }
}
