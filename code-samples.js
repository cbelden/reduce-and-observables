

function accumulator(acc, x) {
	return acc + x;
}

const sum = [1, 2, 3, 4, 5].reduce(accumulator, 0);

console.log(sum);
// > 15




function clickAccumulator(acc, x) {
	if (x === 'blue') {
		acc.blue += 1;
	}

	if (x === 'red') {
		acc.red += 1;
	}

	return acc;
}

const clicks = ['red', 'red', 'blue', 'red'].reduce(clickAccumulator, {
	red: 0,
	blue: 0
});

console.log(clicks);
// > { red: 3, blue: 1 }



// Unit tests
// describe('clickAccumulator', () => {
// 	it('should add 1 blue', () => {
// 		const actual = clickAccumulator({ red: 0, blue: 0}, 'blue');
// 		const expected = { red: 0, blue: 1 };

// 		expect(actual).to.deep.equal(expected);
// 	});

// 	// More unit tests!!!!
// }


const Rx = require('rx');

Rx.Observable.from([1, 2, 3]).subscribe(x => {
	console.log(x);
});

// > 1
// > 2 
// > 3


const button = document.getElementById('my-button');
const buttonClicks = Rx.Observable.fromEvent(button, 'click');
buttonClicks.subscribe(ev => {
	console.log('Hey! You clicked me!!');
});




const sumButton = document.getElementById('sum-button');
const sumCounts = Rx.Observable.fromEvent(sumButton, 'click')
	.scan((acc, ev) => {
		return acc + 1;
	}, 0);

// Emits the running total of clicks!
sumCounts.subscribe(console.log.bind(console));


const initialState = { red: 0, blue: 0 };

class ClickCounter {
	constructor() {
		this._actions = new Rx.Subject();
		this._state = this._actions
			.scan(this.reduce.bind(this), initialState)
			.startWith(initialState);
	}

	reduce(state = initialState, click) {
		switch (click){
			case 'blue':
				return Object.assign({}, state, { blue: state.blue + 1 });

			case 'red':
				return Object.assign({}, state, { red: state.red + 1 });
		}

		return state;
	}

	/**
	 * Returns an Observable that emits each updated state
	 */
	state() {
		return this._state;
	}

	blueClick() {
		this._actions.onNext('blue');
	}

	redClick() {
		this._actions.onNext('red');
	}
}

const clickCounter = new ClickCounter();

// Register actions to click events
const redButton = document.getElementById('red-button');
redButton.onclick = () => clickCounter.redClick();

const blueButton = document.getElementById('blue-button');
blueButton.onclick = () => clickCounter.blueClick();

// Different UI components can subscribe to the same state!

// Render the score board
clickCounter.state()
	.subscribe(state => {
		const html = `Red: ${state.red} Blue: ${state.blue}`;
		document.getElementById('score-board').innerHTML = html;
	});

// Render the current winner
clickCounter.state()
	.subscribe(state => {
		const el = document.getElementById('winning');
		if (state.blue === state.red) {
			el.innerHTML = '';
			return;
		}

		const winning = state.blue > state.red ? 'blue' : 'red';
		const html = `Winning: ${winning}`;
		el.innerHTML = html;
	});




