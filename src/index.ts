import { useSyncExternalStore } from 'react';
import type { ParseActions, SetState } from './types';

export function createStore<
	S extends object,
	A extends Record<string, (setState: SetState<S>, ...args: any[]) => void>,
>({
	initialState,
	actions: rawActions,
}: {
	initialState: S;
	actions: A;
}): {
	getState: () => S;
	setState: SetState<S>;
	actions: ParseActions<A>;
	subscribe: (cb: () => void) => () => void;
	useStore: <T = S>(selector?: (state: S) => T) => T;
} {
	let state = structuredClone(initialState);
	const subscribers = new Set<() => void>();

	const getState = () => state;

	const setState: SetState<S> = (setter) => {
		state = setter(state);

		notify();
	};

	const actions = Object.entries(rawActions).reduce<
		Record<string, (...args: unknown[]) => any>
	>((acc, [key, action]) => {
		acc[key] = (...args: unknown[]) => {
			action(setState, ...args);
		};

		return acc;
	}, {}) as ParseActions<A>;

	const subscribe = (cb: () => void) => {
		subscribers.add(cb);

		return () => subscribers.delete(cb);
	};

	const notify = () => {
		subscribers.forEach((cb) => {
			cb();
		});
	};

	const useStore = <T = S>(
		selector: (s: S) => T = (s) => s as unknown as T,
	): T => {
		return useSyncExternalStore(subscribe, () => selector(getState()));
	};

	return {
		actions,
		getState,
		setState,
		subscribe,
		useStore,
	};
}
