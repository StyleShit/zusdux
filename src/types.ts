export type ParseActions<
	TActions extends Record<string, (...args: any[]) => any>,
> = {
	[Key in keyof TActions]: SliceFirstParam<TActions[Key]>;
};

type SliceFirstParam<F> = F extends (first: any, ...args: infer A) => infer R
	? (...args: A) => R
	: never;

export type SetState<S> = (
	setterOrState: ((prevState: S) => S) | Partial<S>,
) => void;
