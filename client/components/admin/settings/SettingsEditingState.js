import { Mongo } from 'meteor/mongo';
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

import { PrivateSettingsCachedCollection } from '../../../../app/ui-admin/client/SettingsCachedCollection';
import { useDebouncedCallback } from '../../../hooks/useDebouncedCallback';
import { useDebouncedState } from '../../../hooks/useDebouncedState';
import { useReactiveValue } from '../../../hooks/useReactiveValue';

const SettingsEditingContext = createContext({});
SettingsEditingContext.displayName = 'SettingsEditingContext';

export function SettingsEditingState({ children, groupId }) {
	const persistedCollection = useMemo(() => {
		const cachedCollection = new PrivateSettingsCachedCollection();
		cachedCollection.init();
		return cachedCollection.collection;
	}, []);

	const temporaryCollection = useMemo(() => new Mongo.Collection(null), []);

	useEffect(() => {
		const queryHandle = persistedCollection.find().observe({
			added: (data) => {
				temporaryCollection.insert(data);
			},
			changed: (data) => {
				temporaryCollection.update(data._id, data);
			},
			removed: (data) => {
				temporaryCollection.remove(data._id);
			},
		});

		return () => {
			queryHandle.stop();
		};
	}, []);

	const group = useReactiveValue(() => temporaryCollection.findOne({ _id: groupId, type: 'group' }), [groupId]);
	const [changed, setGroupChanged] = useDebouncedState(false, 70);

	const sections = useReactiveValue(() => Object.values(
		temporaryCollection
			.find({ group: groupId }, { sort: { section: 1, sorter: 1, i18nLabel: 1 } })
			.fetch()
			.reduce((sections, setting) => {
				const name = setting.section || '';
				const section = sections[name] || { name };
				section.changed = section.changed || setting.changed;
				section.settings = (section.settings || []).concat(setting);

				return {
					...sections,
					[name]: section,
				};
			}, {})
	), [groupId]);

	const contextValue = useMemo(() => ({
		persistedCollection,
		temporaryCollection,
		group: group ? { ...group, changed } : undefined,
		setGroupChanged,
		sections,
	}), [
		persistedCollection,
		temporaryCollection,
		group,
		changed,
		sections,
	]);

	return <SettingsEditingContext.Provider value={contextValue}>
		{children}
	</SettingsEditingContext.Provider>;
}

SettingsEditingState.WithSection = function WithSection({ children, section }) {
	const upperContextValue = useContext(SettingsEditingContext);

	const [changed, setCurrentSectionChanged] = useDebouncedState(false, 70);

	const contextValue = useMemo(() => ({
		...upperContextValue,
		section: section ? { ...section, changed } : undefined,
		setCurrentSectionChanged,
	}), [upperContextValue]);

	return <SettingsEditingContext.Provider value={contextValue}>
		{children}
	</SettingsEditingContext.Provider>;
};

export const useSettingsGroup = () => useContext(SettingsEditingContext).group;

export const useSettingsGroupSections = () => useContext(SettingsEditingContext).sections;

export const useCurrentSettingsGroupSection = () => useContext(SettingsEditingContext).section;

export const useSettingProps = ({ _id, blocked, enableQuery }) => {
	const {
		persistedCollection,
		temporaryCollection,
		setGroupChanged,
		setCurrentSectionChanged,
	} = useContext(SettingsEditingContext);

	const persistedSetting = useReactiveValue(() => persistedCollection.findOne(_id), [_id]);

	const disabled = useReactiveValue(() => {
		if (blocked) {
			return true;
		}

		if (!enableQuery) {
			return false;
		}

		const queries = [].concat(typeof enableQuery === 'string' ? JSON.parse(enableQuery) : enableQuery);

		return !queries.every((query) => !!temporaryCollection.findOne(query));
	}, [blocked, enableQuery]);

	const [changed, setChanged] = useState(false);
	const [state, setState] = useState(persistedSetting);
	const updateCollection = useDebouncedCallback((data) => {
		temporaryCollection.update({ _id }, { $set: data });
	}, 70, [_id]);

	const onChange = (data) => {
		const changed = Object.entries(data).some(([key, value]) => value !== persistedSetting[key]);
		setChanged(changed);
		setCurrentSectionChanged(changed);
		setGroupChanged(changed);
		setState((state) => ({ ...state, ...data }));
		updateCollection(data);
	};

	const onReset = () => onChange(persistedSetting);

	return {
		...state,
		changed,
		disabled,
		onChange,
		onReset,
	};
};
