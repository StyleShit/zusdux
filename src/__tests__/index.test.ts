import { act } from 'react';
import { createStore } from '../index';
import { renderHook, waitFor } from '@testing-library/react';
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

	it('should not keep the same reference to the original state', () => {
		// Arrange.
		const initialState = {
			name: 'counter',
			count: 0,
		};

		const { getState } = createStore({
			initialState,
			actions: {},
		});

		// Assert.
		expect(getState()).not.toBe(initialState);
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

		// Act.
		actions.setName('John', 'Doe');

		// Assert.
		expect(getState()).toStrictEqual({
			name: 'John Doe',
			count: 3,
		});
	});

	it('should support async actions', async () => {
		// Arrange.
		const { actions, getState } = createStore({
			initialState: {
				users: [] as string[],
				isLoading: false,
			},
			actions: {
				async fetchUsers(set) {
					set((prev) => ({
						...prev,
						isLoading: true,
					}));

					await new Promise((resolve) => setTimeout(resolve, 100));

					set((prev) => ({
						...prev,
						users: ['User 1', 'User 2'],
						isLoading: false,
					}));
				},
			},
		});

		// Act.
		void actions.fetchUsers();

		// Assert.
		expect(getState()).toStrictEqual({
			users: [],
			isLoading: true,
		});

		// Assert.
		await waitFor(() => {
			expect(getState().users).toStrictEqual(['User 1', 'User 2']);
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
			actions.setName('John', 'Doe');
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

		expectTypeOf(actions).toEqualTypeOf<{
			increment: () => void;
			incrementBy: (by: number) => void;
			setName: (firstName: string, lastName: string) => void;
		}>();
	});
});

function createCounter() {
	return createStore({
		initialState: {
			name: 'counter',
			count: 0,
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

			setName: (set, firstName: string, lastName: string) => {
				set((prev) => ({
					...prev,
					name: firstName + ' ' + lastName,
				}));
			},
		},
	});
}
