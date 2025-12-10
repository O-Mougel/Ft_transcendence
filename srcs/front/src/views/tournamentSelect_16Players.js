import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `

		<div class="h-full w-full">
			<form id="tournamentForm8Players" class="pt-[5vw]">
				<div class="flex flex-row justify-around">
					<div class="flex flex-col w-[40vw] gap-4">
						<input id="player1" tabindex="1" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autofocus autocomplete="off" placeholder="Player 1">
						<input id="player2" tabindex="2" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 2">
						<input id="player3" tabindex="3" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 3">
						<input id="player4" tabindex="4" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 4">
						<input id="player5" tabindex="5" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 5">
						<input id="player6" tabindex="6" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 6">
						<input id="player7" tabindex="7" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 7">
						<input id="player8" tabindex="8" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 8">
					</div>
					<div class="flex flex-col w-[40vw] gap-4">
						<input id="player9" tabindex="9" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 9">
						<input id="player10" tabindex="10" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 10">
						<input id="player11" tabindex="11" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 11">
						<input id="player12" tabindex="12" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 12">
						<input id="player13" tabindex="13" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 13">
						<input id="player14" tabindex="14" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 14">
						<input id="player15" tabindex="15" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 15">
						<input id="player16" tabindex="16" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 16">
					</div>
				</div>
				<div class="">
						<input tabindex="17" class="w-[20vw] mt-[1vw] h-[4vw] focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] border hover:border-[#98c6f8] border-white rounded-lg " name="start4Players" type="submit" value="Start" onclick="get16PlayerName(event)">
				</div>
			</form>
		</div>`
	}
}