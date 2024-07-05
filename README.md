# Zusdux

The forbidden love child of Redux and Zustand ❤️‍🔥👶

## What is Zusdux?

Zusdux is a type-safe state management library that combines the best of both worlds from [Redux](https://redux.js.org/) and [Zustand](https://zustand-demo.pmnd.rs/).
It has a [Redux Toolkit](https://redux-toolkit.js.org/)-like API, but with Zustand's reduced boilerplate and simplicity. It also has a built-in support for React!

## API

The API is pretty similar to what you'd find in Redux Toolkit's [createSlice](https://redux-toolkit.js.org/api/createSlice) function, with a leaner signature, and without
the need for [providers](https://react-redux.js.org/api/provider) or messing up with [async thunks](https://redux-toolkit.js.org/api/createAsyncThunk) - similar to Zustand.

It has a single function, called `createStore`, which returns an object with `getState`, `setState`, `subscribe`, `useStore`, and `actions` properties.

## Usage

First, you create a store with the `createStore` function. It takes an object with `initialState` and `actions` properties:

-   `initialState` - It's... well... the _initial state_ of your store

-   `actions` - An object containing a list of actions that can be performed on the state. The actions can be either synchronous or asynchronous, they can take any
    number of arguments, while the first one is a `set` function that allows you to update the store's stat. The `set` function can accept either a new state object
    that will be shallowly merged with the current state, or a function that receives the current state and returns the new state.
    (See [Zustand](https://docs.pmnd.rs/zustand/guides/updating-state)'s documentation for more info)

```ts
// store.ts
import { createStore } from 'zusdux';

export const { actions, getState, setState, subscribe, useStore } = createStore(
	{
		initialState: {
			name: 'counter',
			count: 0,
			isLoading: false,
		},
		actions: {
			increment: (set) => {
				set((prev) => ({
					...prev,
					count: prev.count + 1,
				}));
			},

			incrementBy: (set, by: number) => {
				set((prev) => ({
					...prev,
					count: prev.count + by,
				}));
			},

			incrementAsync: async (set) => {
				set((prev) => ({
					...prev,
					isLoading: true,
				}));

				await new Promise((resolve) => setTimeout(resolve, 100));

				set((prev) => ({
					...prev,
					count: prev.count + 1,
					isLoading: false,
				}));
			},

			setName: (set, firstName: string, lastName: string) => {
				set({ name: firstName + ' ' + lastName });
			},
		},
	},
);
```

Each "store action" is then converted to a "user action" under the store object, which will update the store's state when called:

```ts
actions.increment();
actions.incrementBy(5);
await actions.incrementAsync();
actions.setName('new', 'name');
```

In addition, you can access the current store's state with the `getState` function, and update it with the `setState` function:

```ts
const currentState = getState(); // { name: 'counter', count: 0 }

setState((prev) => ({
	...prev,
	count: 5,
}));

const updatedState = getState(); // { name: 'counter', count: 5 }
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
	const { name, count, isLoading } = useStore();

	return (
		<div>
			<h1>{name}</h1>
			<p>{isLoading ? 'Loading...' : 'Not loading'}</p>
			<p>Count: {count}</p>

			<button onClick={actions.increment}>Increment</button>

			<button onClick={() => actions.incrementBy(5)}>
				Increment by 5
			</button>

			<button onClick={actions.incrementAsync}>Increment async</button>

			<button onClick={() => actions.setName('new', 'name')}>
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
