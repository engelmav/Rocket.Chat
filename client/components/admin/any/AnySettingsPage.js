import { Meteor } from 'meteor/meteor';
import React from 'react';
import s from 'underscore.string';

import { useAtLeastOnePermission } from '../../../hooks/usePermissions';
import { useTranslation } from '../../../hooks/useTranslation';
import { Button } from '../../basic/Button';
import { Icon } from '../../basic/Icon';
import { MarkdownText } from '../../basic/MarkdownText';
import { RawText } from '../../basic/RawText';
import { Header } from '../../header/Header';
import { useAdminSidebar } from '../useAdminSidebar';
import { SettingsEditingState, useSettingsGroup, useSettingsGroupSections, useSettingProps } from './SettingsEditingState';
import { SectionPanel } from './SectionPanel';


function GenericSettingInput({ _id, value, placeholder, readonly, autocomplete, disabled, onChange }) {
	const handleChange = (event) => {
		const { value } = event.currentTarget;
		onChange({ value });
	};

	return <input type='text' className='rc-input__element' name={_id} value={value} placeholder={placeholder}
		disabled={disabled} readOnly={readonly} autoComplete={autocomplete === false ? 'off' : undefined}
		onChange={handleChange} />;
}

function BooleanSettingInput({ _id, disabled, readonly, autocomplete, value, onChange }) {
	const t = useTranslation();

	const handleChange = (event) => {
		const value = event.currentTarget.value === '1';
		onChange({ value });
	};

	return <>
		<label>
			<input type='radio' name={_id} value='1' checked={value === true} disabled={disabled} readOnly={readonly}
				autoComplete={autocomplete === false ? 'off' : undefined} onChange={handleChange} /> {t('True')}
		</label>
		<label>
			<input type='radio' name={_id} value='0' checked={value === false} disabled={disabled} readOnly={readonly}
				autoComplete={autocomplete === false ? 'off' : undefined} onChange={handleChange} /> {t('False')}
		</label>
	</>;
}

function SettingField({ setting }) {
	const t = useTranslation();

	const settingProps = useSettingProps(setting);

	const {
		_id,
		disableReset,
		readonly,
		type,
		value,
		packageValue,
		blocked,
		changed,
		i18nLabel,
		i18nDescription,
		alert,
		onReset,
	} = settingProps;

	const hasResetButton = !disableReset && !readonly && type !== 'asset' && value !== packageValue && !blocked;

	return <div className={['input-line', 'double-col', changed && 'setting-changed'].filter(Boolean).join(' ')}>
		<label className='setting-label' title={_id}>{(i18nLabel && t(i18nLabel)) || (_id || t(_id))}</label>
		<div className='setting-field'>
			{(type === 'boolean' && <BooleanSettingInput {...settingProps} />)
				|| <GenericSettingInput {...settingProps} />}
			{/* {setting.type === 'string' && <StringSettingInput setting={setting} />} */}
			{/* {setting.type === 'relativeUrl' && <RelativeUrlSettingInput setting={setting} />} */}
			{/* {setting.type === 'password' && <PasswordSettingInput setting={setting} />} */}
			{/* {setting.type === 'int' && <IntSettingInput setting={setting} />} */}
			{/* {setting.type === 'select' && <SelectSettingInput setting={setting} />} */}
			{/* {setting.type === 'language' && <LanguageSettingInput setting={setting} />} */}
			{/* {setting.type === 'color' && <ColorSettingInput setting={setting} />} */}
			{/* {setting.type === 'font' && <FontSettingInput setting={setting} />} */}
			{/* {setting.type === 'code' && <CodeSettingInput setting={setting} />} */}
			{/* {setting.type === 'action' && <ActionSettingInput setting={setting} didSectionChange={didSectionChange} />} */}
			{/* {setting.type === 'asset' && <AssetSettingInput setting={setting} />} */}
			{/* {setting.type === 'roomPick' && <RoomPickSettingInput setting={setting} />} */}

			{t.exists(i18nDescription) && <div className='settings-description secondary-font-color'>
				<MarkdownText>{t(i18nDescription)}</MarkdownText>
			</div>}

			{alert && <div className='settings-alert pending-color pending-background pending-border'>
				<Icon icon='icon-attention' />
				<RawText>{t(alert)}</RawText>
			</div>}
		</div>

		{hasResetButton && <Button aria-label={t('Reset')} data-setting={_id} cancel onClick={onReset}>
			<Icon icon='icon-ccw' className='color-error-contrast' />
		</Button>}
	</div>;
}

function Inner() {
	const t = useTranslation();
	const group = useSettingsGroup();
	const sections = useSettingsGroupSections();

	const sectionIsCustomOAuth = (sectionName) => sectionName && /^Custom OAuth:\s.+/.test(sectionName);

	const callbackURL = (sectionName) => {
		const id = s.strRight(sectionName, 'Custom OAuth: ').toLowerCase();
		return Meteor.absoluteUrl(`_oauth/${ id }`);
	};

	if (!group) {
		// TODO
		return <section className='page-container page-static page-settings'>
			<Header />
			<div className='content' />
		</section>;
	}

	return <section className='page-container page-static page-settings'>
		<Header rawSectionName={t(group.i18nLabel)}>
			<Header.ButtonSection>
				{group.changed && <Button cancel className='discard'>{t('Cancel')}</Button>}
				<Button primary disabled={!group.changed} className='save'>{t('Save_changes')}</Button>
				{group._id === 'OAuth' && <>
					<Button secondary className='refresh-oauth'>{t('Refresh_oauth_services')}</Button>
					<Button secondary className='add-custom-oauth'>{t('Add_custom_oauth')}</Button>
				</>}
				{group._id === 'Assets' && <>
					<Button secondary className='refresh-clients'>{t('Apply_and_refresh_all_clients')}</Button>
				</>}
			</Header.ButtonSection>
		</Header>

		<div className='content'>
			{t.exists(group.i18nDescription) && <div className='info'>
				<p className='settings-description'>{t(group.i18nDescription)}</p>
			</div>}

			<div className='page-settings rocket-form'>
				{sections.map((section) => <SettingsEditingState.WithSection key={section.name} section={section}>
					<SectionPanel name={section.name} defaultCollapsed={!!section.name} help={sectionIsCustomOAuth(section.name) && <RawText>{t('Custom_oauth_helper', callbackURL(section.name))}</RawText>}>

						{section.settings.map((setting) => <SettingField key={setting._id} setting={setting} />)}

						{group._id !== 'Assets' && <div className='input-line double-col'>
							<label className='setting-label'>{t('Reset_section_settings')}</label>
							<div className='setting-field'>
								<Button cancel data-section={section.name} className='reset-group'>
									{t('Reset')}
								</Button>
							</div>
						</div>}

						{group._id === 'OAuth' && sectionIsCustomOAuth(section.name) && <div className='submit'>
							<Button cancel className='remove-custom-oauth'>{t('Remove_custom_oauth')}</Button>
						</div>}
					</SectionPanel>
				</SettingsEditingState.WithSection>)}
			</div>
		</div>
	</section>;
}

export function AnySettingsPage({ group: groupId }) {
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
		<Inner />
	</SettingsEditingState>;
}
