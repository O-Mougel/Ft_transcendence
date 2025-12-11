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
			<form id="tournamentForm4Players" class="mt-[5vw]">
					<input id="player1" tabindex="1" class="pb-2 w-[50vw] mt-[1vw] pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autofocus autocomplete="off" placeholder="Player 1">
					<input id="player2" tabindex="2" class="pb-2 w-[50vw] mt-[1vw] pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 2">
					<input id="player3" tabindex="3" class="pb-2 w-[50vw] mt-[1vw] pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 3">
					<input id="player4" tabindex="4" class="pb-2 w-[50vw] mt-[1vw] pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 4">
				<div class="">
					<input tabindex="5" class="shadow-[0_0_20px_rgba(158,202,237,0.9)] w-[20vw] mt-[1vw] h-[4vw] focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] border hover:border-[#98c6f8] border-white rounded-lg " name="start4Players" type="submit" value="Start" onclick="get4PlayerName(event)">
				</div>
			</form>
		</div>`
	}
}