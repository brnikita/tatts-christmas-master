// Config File for API

window.config = {};

config.api = {
	gameboard: 'https://test.escratchie.com/api/tattsxmas/panel_board', 
	member_auth: 'https://test.escratchie.com/api/tattsxmas/member_auth',
	scratch: 'https://test.escratchie.com/api/tattsxmas/scratch',
	claim: 'https://test.escratchie.com/api/tattsxmas/claim',
	register: 'https://test.escratchie.com/api/tattsxmas/register',
	// gameboard: 'API/panel_board.json', // Post { playerObject: [object], gameType: [int 250,500,1000] } 
	// member_auth: 'API/member_auth.json', // Post { playerObject: [object] }
	// scratch: 'API/scratch.json', // Post { playerObject: [object], panel: [int] } EXPECTS:  { reveal: url2svg, game_state: null (keep scratching) | true (win) | false (loss) }
}


/*

playerObject : {
	email: [string],
	name: [string],
	state: [string],
	age: [int],
	postcode: [int],
	sys: [string], //10 char syscode
	dob_day: [string], //str leading 0
	dob_month: [string], //str leading 0
	dob_year: [int]
	address1: [string],
	address2: [string],
	city: [string],
	optin: [on], // there is a optin check box for somthing...
}

*/