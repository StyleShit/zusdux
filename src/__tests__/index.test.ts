import { describe, expect, expectTypeOf, it } from 'vitest';
import { createStore } from '../index';

describe('Zusdux', () => {
	it('should set a default state on creation', () => {
		// Arrange.
		const { getState } = createCounter();

		// Assert.
		expect(getState()).toStrictEqual({
			name: 'counter',
			count: 0,
		});
	});

	it('should change the state using actions', () => {
		// Arrange.
		const { actions, getState } = createCounter();

		// Act.
		actions.increment();

		// Assert.
		expect(getState()).toStrictEqual({
			name: 'counter',
			count: 1,
		});

		// Act.
		actions.incrementBy(2);

		// Assert.
		expect(getState()).toStrictEqual({
			name: 'counter',
			count: 3,
		});
	});

	it('should have proper types', () => {
		// Arrange.
		const { actions, getState } = createCounter();

		// Assert.
		expectTypeOf(getState).toEqualTypeOf<
			() => { name: string; count: number }
		>();

		expectTypeOf(actions.increment).toEqualTypeOf<() => void>();

		expectTypeOf(actions.incrementBy).toEqualTypeOf<
			(payload: number) => void
		>();
	});
});

function createCounter() {
	return createStore({
		initialState: {
			name: 'counter',
			count: 0,
		},
		reducer: {
			increment: (state) => ({
				...state,
				count: state.count + 1,
			}),

			incrementBy: (state, by: number) => ({
				...state,
				count: state.count + by,
			}),
		},
	});
}
