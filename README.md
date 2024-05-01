# Zusdux

The forbidden love child of Redux and Zustand ❤️‍🔥👶

## What is Zusdux?

Zusdux is a type-safe state management library that combines the best of both worlds from [Redux](https://redux.js.org/) and [Zustand](https://zustand-demo.pmnd.rs/).
It has a [Redux Toolkit](https://redux-toolkit.js.org/)-like API, but with Zustand's reduced boilerplate and simplicity. It also has a built-in support for React!

## API

The API is pretty similar to what you'd find in Redux Toolkit's [createSlice](https://redux-toolkit.js.org/api/createSlice) function, with a leaner signature, and without the need for providers - similar to Zustand.

It has a single function, called `createStore`, which returns an object with `getState`, `subscribe`, `useStore`, and `actions` properties.

## Usage

First, you create a store with the `createStore` function. It takes an object with `initialState` and `reducers` properties.

-   `initialState` - It's... well... the _initial state_ of your store

-   `reducers` - An object containing the "[case reducers](https://redux-toolkit.js.org/api/createSlice#reducers)" of your store

```ts
// store.ts
import { createStore } from 'zusdux';

export const { actions, getState, subscribe, useStore } = createStore({
	initialState: {
		name: 'counter',
		count: 0,
	},
	reducers: {
		increment: (state) => ({
			...state,
			count: state.count + 1,
		}),

		incrementBy: (state, by: number) => ({
			...state,
			count: state.count + by,
		}),

		setName: (state, newName: string) => ({
			...state,
			name: newName,
		}),
	},
});
```

Each "case reducer" is then converted to an action under the store object, which will update the store's state when called:

```ts
actions.increment();
actions.incrementBy(5);
actions.setName('new name');
```

In addition, you can access the current store's state with the `getState` function:

```ts
const currentState = getState(); // { name: 'counter', count: 0 }

actions.increment();

const updatedState = getState(); // { name: 'counter', count: 1 }
```

Similar to Redux, you can also subscribe to the store's state changes:

```ts
const unsubscribe = subscribe(() => {
	console.log('Current state:', getState());
});

unsubscribe();
```

And similar to Zustand, you can use the store within your React components:

```tsx
// Counter.tsx
import { actions, useStore } from './store';

export const Counter = () => {
	const { name, count } = useStore();

	return (
		<div>
			<h1>{name}</h1>
			<p>Count: {count}</p>

			<button onClick={actions.increment}>Increment</button>

			<button onClick={() => actions.incrementBy(5)}>
				Increment by 5
			</button>

			<button onClick={() => actions.setName('new name')}>
				Set name
			</button>
		</div>
	);
};
```

You can also provide a selector to the `useStore` function to select a specific part of the store, similar to what you'd do with Redux's [useSelector](https://react-redux.js.org/api/hooks#useselector)

```tsx
const count = useStore((state) => state.count);
```

This way, your component will only re-render when the selected part of the store changes.

As you might've noticed, we don't need a provider at all! 🥳
