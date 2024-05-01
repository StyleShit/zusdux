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
} {
	let state = structuredClone(initialState);
	const subscribers = new Set<() => void>();

	const getState = () => state;

	const actions = Object.entries(reducer).reduce<
		Record<string, (...args: unknown[]) => any>
	>((acc, [key, reducer]) => {
		acc[key] = (...args: unknown[]) => {
			state = reducer(state, ...args);

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

	return {
		actions,
		getState,
		subscribe,
	};
}
