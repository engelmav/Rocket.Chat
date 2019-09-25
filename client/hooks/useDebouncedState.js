import { useState } from 'react';

import { useDebouncedCallback } from './useDebouncedCallback';

export const useDebouncedState = (initialValue, wait, imediate = false) => {
	const [value, setValue] = useState(initialValue);
	const debouncedSetValue = useDebouncedCallback(setValue, wait, [], imediate);

	return [value, debouncedSetValue];
};
