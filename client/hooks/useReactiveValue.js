import { useState } from 'react';

import { useTracker } from './useTracker';

export const useReactiveValue = (getValue, deps = []) => {
	const [value, setValue] = useState(getValue);

	useTracker(() => {
		setValue(getValue);
	}, deps);

	return value;
};
