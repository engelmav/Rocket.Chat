import React from 'react';

import { useAtLeastOnePermission } from '../../../hooks/usePermissions';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAdminSidebar } from '../useAdminSidebar';
import { AssetsSettingsGroup } from './groups/AssetsSettingsGroup';
import { OAuthSettingsGroup } from './groups/OAuthSettingsGroup';
import {
	SettingsEditingState,
	useSettingsGroup,
	useSettingsGroupSections,
} from './SettingsEditingState';
import { SettingsGroup } from './SettingsGroup';
import { SettingsGroupSection } from './SettingsGroupSection';

export function SettingsPage({ group: groupId }) {
	useAdminSidebar();

	const t = useTranslation();

	const hasPermission = useAtLeastOnePermission([
		'view-privileged-setting',
		'edit-privileged-setting',
		'manage-selected-settings',
	]);

	if (!hasPermission) {
		// TODO
		return <section className='page-container page-static page-settings'>
			<div className='content'>
				<p>{t('You_are_not_authorized_to_view_this_page')}</p>
			</div>
		</section>;
	}

	return <SettingsEditingState groupId={groupId}>
		<section className='page-container page-static page-settings'>
			<SettingsPage.Inner />
		</section>
	</SettingsEditingState>;
}

SettingsPage.Inner = function SettingsPageInner() {
	const group = useSettingsGroup();
	const sections = useSettingsGroupSections();

	if (!group) {
		return null;
	}

	if (group._id === 'Assets') {
		return <AssetsSettingsGroup />;
	}

	if (group._id === 'OAuth') {
		return <OAuthSettingsGroup />;
	}

	return <SettingsGroup>
		{sections.map((section) => <SettingsGroupSection key={section.name} section={section} />)}
	</SettingsGroup>;
};
