export type ParseActions<
	A extends Record<string, (setState: any, ...args: any[]) => any>,
> = {
	[K in keyof A]: SliceFirstParam<A[K]>;
};

type SliceFirstParam<T> = T extends (first: any, ...args: infer A) => infer R
	? (...args: A) => R
	: never;

export type SetState<S> = (
	setterOrState: ((prevState: S) => S) | Partial<S>,
) => void;
