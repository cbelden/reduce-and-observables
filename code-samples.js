// Using reduce to sum a list of integers

function accumulator(acc, x) {
	return acc + x;
}

const sum = [1, 2, 3, 4, 5].reduce(accumulator, 0);

console.log(sum);
// > 15


// Using reduce to count a series of strings


function colorAccumulator(acc, x) {
	if (x === 'blue') {
		acc.blue += 1;
	}

	if (x === 'red') {
		acc.red += 1;
	}

	return acc;
}


function pureColorAccumulator(acc, x) {
	switch (x) {
		case 'blue':
			return Object.assign({}, acc, { blue: acc.blue + 1 });
		case 'red':
			return Object.assign({}, acc, { red: acc.red + 1 });
		default:
			return acc;
	}
}


const clicks = ['red', 'red', 'blue', 'red'].reduce(pureColorAccumulator, {
	red: 0,
	blue: 0
});

console.log(clicks);
// > { red: 3, blue: 1 }



// Sample unit tests
// describe('clickAccumulator', () => {
// 	it('should add 1 blue', () => {
// 		const actual = clickAccumulator({ red: 0, blue: 0}, 'blue');
// 		const expected = { red: 0, blue: 1 };

// 		expect(actual).to.deep.equal(expected);
// 	});

// 	// More unit tests!!!!
// }


const Rx = require('rx');

// Transforming an array into an observable sequence

Rx.Observable.from([1, 2, 3]).subscribe(x => {
	console.log(x);
});

// > 1
// > 2 
// > 3


// Modeling user clicks as an observable sequence

const button = document.getElementById('my-button');
const buttonClicks = Rx.Observable.fromEvent(button, 'click');
buttonClicks.subscribe(ev => {
	console.log('Hey! You clicked me!!');
});

// CLICK
// > Hey! You clicked me!!


// Summing user clicks using Rx.Observable.prototype.scan

const sumButton = document.getElementById('sum-button');
const sumCounts = Rx.Observable.fromEvent(sumButton, 'click')
	.scan((acc, ev) => {
		return acc + 1;
	}, 0);

// Emits the running total of clicks!
sumCounts.subscribe(console.log.bind(console));


// CLICK
// > 1
// CLICK
// > 2
// CLICK
// > 3


// Demo application using Observables + reduce to maintain/control application state


// Our initial application state
const initialState = { red: 0, blue: 0 };

/**
 * Responsible for managing the application state for a click counter.
 */
class ClickCounter {
	constructor() {
		// An Rx.Subject is an observable that exposes an API for pushing items onto the Observable sequence
		this._actions = new Rx.Subject();

		// Our state is simply a result of accumulating all of our actions over time!
		this._state = this._actions
			.scan(this.reduce.bind(this), initialState)
			.startWith(initialState);
	}

	// Same aggregation function used in the string summing example! This function
	// is pure so we can test it to our heart's content. Which is great because most of
	// our application logic lives here.
	reduce(state, action) {
		switch (action) {
			case 'blue':
				return Object.assign({}, state, { blue: state.blue + 1 });
			case 'red':
				return Object.assign({}, state, { red: state.red + 1 });
			default:
				return state;
		}
	}

	/**
	 * Returns an Observable that emits each updated state
	 */
	state() {
		return this._state;
	}

	/**
	 * Here, our action creators expose an API that allow the UI to push
	 * events/actions onto the actions observable.
	 */

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




