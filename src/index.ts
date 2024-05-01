import { useSyncExternalStore } from 'react';

type Actionify<R extends Record<string, (state: any, payload?: any) => any>> = {
	[K in keyof R]: Parameters<R[K]>['length'] extends 2
		? (payload: Parameters<R[K]>[1]) => void
		: () => void;
};

export function createStore<
	S extends object,
	R extends Record<string, (state: S, payload?: any) => S>,
>({
	initialState,
	reducer,
}: {
	initialState: S;
	reducer: R;
}): {
	getState: () => S;
	actions: Actionify<R>;
	subscribe: (cb: () => void) => () => void;
	useStore: () => S;
} {
	let state = structuredClone(initialState);
	const subscribers = new Set<() => void>();

	const getState = () => state;

	const actions = Object.entries(reducer).reduce<
		Record<string, (...args: unknown[]) => any>
	>((acc, [key, fn]) => {
		acc[key] = (...args: unknown[]) => {
			state = fn(state, ...args);

			notify();
		};

		return acc;
	}, {}) as Actionify<R>;

	const subscribe = (cb: () => void) => {
		subscribers.add(cb);

		return () => subscribers.delete(cb);
	};

	const notify = () => {
		subscribers.forEach((cb) => {
			cb();
		});
	};

	const useStore = () => {
		return useSyncExternalStore(subscribe, getState);
	};

	return {
		actions,
		getState,
		subscribe,
		useStore,
	};
}
