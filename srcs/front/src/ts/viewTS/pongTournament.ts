import ViewTemplate from "./ViewTemplate.js";
import { CONTEXT } from "../gameTS/context.js";
import type { GameMode } from '../types/game.types';
import { alertBoxMsg, backToDefaultPage } from "../eventTS/userLog.js";

export default class PongView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Tournament Match");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover bg-center p-4 rounded-[50%] opacity-0 shadow object-cover sm:w-[170px] sm:h-[170px] md:w-[18vh] md:h-[18vh]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold underline mx-4 mb-10 text-2xl lg:text-5xl "></h1>
					<a href="/profileStats" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl lg:text-4xl mb-8 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4 w-full">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl lg:text-3xl cursor-pointer py-2 mb-10 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left animate-slide-fade-up" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-8 lg:mt-15 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl lg:text-3xl cursor-pointer mt-10 px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left animate-slide-fade-up"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-full ">
							<form class="flex items-center py-2 h-full w-full mt-5">
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-[70%] w-[80%] lg:text-3xl px-2 rounded-l-md border border-white bg-transparent focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-[70%] w-[10%] bg-[#98c6f8] text-black rounded-r-md text-sm lg:text-3xl type="submit" onclick="sendNewFriendRequest(event)" >🔍</button>
							</form>
							<p id="friendSearchResults" class="mt-4 text-2xl text-red-500 text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>
			
			
			<div class="h-full flex w-full justify-center">
				<div class="pt-5 flex flex-col gap-4 items-center">
			  		<div class="relative flex items-center w-full">
						<div class="flex-1 text-left flex flex-col text-blue-300">
							<span id="LeftPlayer" class="inline-block"> </span>
						</div>

						<div id="Scores" class="absolute left-1/2 transform -translate-x-1/2 flex items-center font-bold hidden">
							<div class="flex items-center">
								<h3 class="px-4" id="LeftScore" value="0">0</h3>
								<span>-</span>
								<h3 class="px-4" id="RightScore" value="0">0</h3>
							</div>
						</div>

						<div class="flex-1 text-right flex flex-col text-red-300">
							<span id="RightPlayer" class="inline-block"> </span>
						</div>
					</div>
					
					<div class="relative">
						<canvas id="canvas" class="bg-black border-4 rounded-[2%] border-[#98c6f8] w-[64dvw] aspect-16/10"></canvas>
						<button id="startButton" class="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-[#5b90c9] font-bold rounded-lg hover:bg-[#7aaedc] z-30">Start Game</button>
						<div id="GameOver" class="hidden absolute top-4 left-1/2 transform -translate-x-1/2 border rounded-[5%] border-dashed justify-center items-center p-4 z-20">
							<div class="flex items-center">
								<span id=winnerGameSpan></span>
							</div>
							<div class="flex justify-center items-center">
								<span id="GameOverScore">0 - 0</span>
							</div>
						</div>
					</div>
					
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
								<span id="hideUpVsAi">🢁</span>
								<span id="hideDownVsAi">🢃</span>
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

					<a id="backToTournament" href="/tournament" class="hidden px-6 py-3 bg-transparent border border-[#98c6f8] font-bold rounded-lg hover:bg-white/10 cursor-pointer" data-link>Back to tournament</a>
					</div>
			</div>`;
	}

	async init(): Promise<void> {
		const mode: GameMode = (location.pathname === '/pongAI') ? 0 : (location.pathname === '/pongRanked') ? 3 : (location.pathname === '/pong2') ? 2 : 1;
		const module = await import("../gameTS/pong.js");

		if (window.sessionStorage.getItem("tournamentEnded") && window.sessionStorage.getItem("tournamentEnded") == "true")
		{
			alertBoxMsg("❌ This tournament no longer exists !");
			return backToDefaultPage();
		}
		if (typeof module.initPong === "function")
			module.initPong({ mode, gameId: CONTEXT.gameId });

		window.handlePongModeDisplay(mode, CONTEXT.leftName, CONTEXT.rightName);
	}
}
