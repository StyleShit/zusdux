import { useSyncExternalStore } from 'react';
import type { ParseActions, SetState } from './types';

export function createStore<
	TState extends object,
	TActions extends Record<
		string,
		(setState: SetState<TState>, ...args: any[]) => void
	>,
>({
	initialState,
	actions: rawActions,
}: {
	initialState: TState;
	actions: TActions;
}): {
	getState: () => TState;
	setState: SetState<TState>;
	actions: ParseActions<TActions>;
	subscribe: (cb: () => void) => () => void;
	useStore: <R = TState>(selector?: (state: TState) => R) => R;
} {
	let state = structuredClone(initialState);
	const subscribers = new Set<() => void>();

	const getState = () => state;

	const setState: SetState<TState> = (setterOrState) => {
		state =
			typeof setterOrState === 'function'
				? setterOrState(state)
				: { ...state, ...setterOrState };

		notify();
	};

	const actions = Object.entries(rawActions).reduce<
		Record<string, (...args: unknown[]) => any>
	>((acc, [key, action]) => {
		acc[key] = (...args: unknown[]) => {
			action(setState, ...args);
		};

		return acc;
	}, {}) as ParseActions<TActions>;

	const subscribe = (cb: () => void) => {
		subscribers.add(cb);

		return () => subscribers.delete(cb);
	};

	const notify = () => {
		subscribers.forEach((cb) => {
			cb();
		});
	};

	const useStore = <TReturn = TState>(
		selector: (s: TState) => TReturn = (s) => s as unknown as TReturn,
	): TReturn => {
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
