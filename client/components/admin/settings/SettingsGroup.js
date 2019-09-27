import React from 'react';

import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../basic/Button';
import { Header } from '../../header/Header';
import { useSettingsGroup } from './SettingsEditingState';

export function SettingsGroup({ children, headerButtons }) {
	const t = useTranslation();
	const group = useSettingsGroup();

	if (!group) {
		// TODO
		return <>
			<Header />
			<div className='content' />
		</>;
	}

	return <>
		<Header rawSectionName={t(group.i18nLabel)}>
			<Header.ButtonSection>
				{group.changed && <Button cancel className='discard'>{t('Cancel')}</Button>}
				<Button primary disabled={!group.changed} className='save'>{t('Save_changes')}</Button>
				{headerButtons}
			</Header.ButtonSection>
		</Header>

		<div className='content'>
			{t.exists(group.i18nDescription) && <div className='info'>
				<p className='settings-description'>{t(group.i18nDescription)}</p>
			</div>}

			<div className='page-settings rocket-form'>
				{children}
			</div>
		</div>
	</>;
}
