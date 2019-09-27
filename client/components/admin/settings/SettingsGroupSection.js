import React from 'react';

import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../basic/Button';
import { SectionPanel } from './SectionPanel';
import { SettingsEditingState } from './SettingsEditingState';
import { SettingField } from './SettingField';

export function SettingsGroupSection({ children, section, hasReset = true, help }) {
	const t = useTranslation();

	return <SettingsEditingState.WithSection key={section.name} section={section}>
		<SectionPanel name={section.name} defaultCollapsed={!!section.name} help={help}>

			{section.settings.map((setting) => <SettingField key={setting._id} setting={setting} />)}

			{hasReset && <div className='input-line double-col'>
				<label className='setting-label'>{t('Reset_section_settings')}</label>
				<div className='setting-field'>
					<Button cancel data-section={section.name} className='reset-group'>
						{t('Reset')}
					</Button>
				</div>
			</div>}

			{children}
		</SectionPanel>
	</SettingsEditingState.WithSection>;
}
