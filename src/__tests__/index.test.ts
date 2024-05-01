import { act } from 'react';
import { createStore } from '../index';
import { renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

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

	it('should subscribe to changes using a subscribe function', () => {
		// Arrange.
		const { actions, subscribe } = createCounter();

		const onChange = vi.fn();

		// Act.
		const unsubscribe = subscribe(onChange);

		actions.increment();

		// Assert.
		expect(onChange).toHaveBeenCalledOnce();

		// Act.
		unsubscribe();

		actions.increment();

		// Assert.
		expect(onChange).toHaveBeenCalledOnce();
	});

	it('should subscribe to changes using a React hook', () => {
		// Arrange.
		const { actions, useStore } = createCounter();

		// Act.
		const { result } = renderHook(() => useStore());

		// Assert.
		expect(result.current).toStrictEqual({
			name: 'counter',
			count: 0,
		});

		// Act.
		act(actions.increment);

		// Assert.
		expect(result.current).toStrictEqual({
			name: 'counter',
			count: 1,
		});
	});

	it('should subscribe to changes using a React hook with selector', () => {
		// Arrange.
		const { actions, useStore } = createCounter();

		// Act.
		const { result } = renderHook(() => useStore((s) => s.count));

		// Assert.
		expect(result.current).toBe(0);

		// Act.
		act(actions.increment);

		// Assert.
		expect(result.current).toBe(1);
	});

	it('should not re-render unnecessarily when using a React hook with selector', () => {
		// Arrange.
		const { actions, useStore } = createCounter();
		let renders = 0;

		// Act.
		renderHook(() => {
			renders++;

			return useStore((s) => s.count);
		});

		act(actions.increment);

		// Assert.
		expect(renders).toBe(2);

		// Act.
		act(() => {
			actions.setName('new-name');
		});

		// Assert.
		expect(renders).toBe(2);
	});

	it('should have proper types', () => {
		// Arrange.
		const { actions, getState, useStore } = createCounter();

		type ExpectedState = {
			name: string;
			count: number;
		};

		// Assert.
		expectTypeOf(getState).toEqualTypeOf<() => ExpectedState>();

		expectTypeOf(useStore).toEqualTypeOf<
			<T = ExpectedState>(selector?: (s: ExpectedState) => T) => T
		>();

		expectTypeOf(actions.increment).toEqualTypeOf<() => void>();

		expectTypeOf(actions.incrementBy).toEqualTypeOf<
			(payload: number) => void
		>();

		expectTypeOf(actions.setName).toEqualTypeOf<
			(payload: string) => void
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

			setName: (state, newName: string) => ({
				...state,
				name: newName,
			}),
		},
	});
}
