import { useState } from 'react';
import { Tracker } from 'meteor/tracker';

import { useTracker } from './useTracker';

export const useReactiveValue = (getValue, deps = []) => {
	const [value, setValue] = useState(() => Tracker.nonreactive(getValue));

	useTracker(() => {
		const newValue = getValue();
		setValue(() => newValue);
	}, deps);

	return value;
};
