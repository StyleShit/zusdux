export type ParseActions<
	A extends Record<string, (setState: any, ...args: any[]) => any>,
> = {
	[K in keyof A]: A[K] extends (
		first: any,
		...args: infer Args
	) => infer Return
		? (...args: Args) => Return
		: never;
};

export type SetState<S> = (
	setterOrState: ((prevState: S) => S) | Partial<S>,
) => void;
