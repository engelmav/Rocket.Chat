import { useCallback } from 'react';
import _ from 'underscore';

export const useDebouncedCallback = (callback, wait, deps, imediate = false) =>
	useCallback(_.debounce(callback, wait, imediate), [wait, imediate, ...deps]);
