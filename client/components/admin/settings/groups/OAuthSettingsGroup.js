import { Meteor } from 'meteor/meteor';
import React from 'react';
import s from 'underscore.string';

import { useTranslation } from '../../../../hooks/useTranslation';
import { Button } from '../../../basic/Button';
import { RawText } from '../../../basic/RawText';
import { useSettingsGroupSections } from '../SettingsEditingState';
import { SettingsGroup } from '../SettingsGroup';
import { SettingsGroupSection } from '../SettingsGroupSection';

export function OAuthSettingsGroup() {
	const t = useTranslation();

	const sections = useSettingsGroupSections();

	const sectionIsCustomOAuth = (sectionName) => sectionName && /^Custom OAuth:\s.+/.test(sectionName);

	const callbackURL = (sectionName) => {
		const id = s.strRight(sectionName, 'Custom OAuth: ').toLowerCase();
		return Meteor.absoluteUrl(`_oauth/${ id }`);
	};

	return <SettingsGroup headerButtons={<>
		<Button secondary className='refresh-oauth'>{t('Refresh_oauth_services')}</Button>
		<Button secondary className='add-custom-oauth'>{t('Add_custom_oauth')}</Button>
	</>}>
		{sections.map((section) => (sectionIsCustomOAuth(section.name)
			? <SettingsGroupSection key={section.name} section={section} help={<RawText>{t('Custom_oauth_helper', callbackURL(section.name))}</RawText>}>
				<div className='submit'>
					<Button cancel className='remove-custom-oauth'>{t('Remove_custom_oauth')}</Button>
				</div>
			</SettingsGroupSection>
			: <SettingsGroupSection key={section.name} section={section} />))}
	</SettingsGroup>;
}
