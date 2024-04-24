import { Trans, Translation } from 'react-i18next';
import StyledInput from '../components/Input/Common';
import NoContent from '../components/NoContent/NoContent';
import Tags from '../components/Tags/Common/Tags';
import { CloseCircleOutlined } from '@ant-design/icons';
import TreeSelectOption from '../components/TreeSelectOption';
import Select from '../components/Select';
import { Col, Form, Row } from 'antd';
import ImageUpload from '../components/ImageUpload';
import TextArea from 'antd/lib/input/TextArea';
import BilingualInput from '../components/BilingualInput';
import { entitiesClass } from './entitiesClass';
import { contentLanguage } from './contentLanguage';
import StyledSwitch from '../components/Switch/StyledSwitch';

const calendarLanguages = [
  {
    value: contentLanguage.ENGLISH,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.en')}</Translation>,
  },
  {
    value: contentLanguage.FRENCH,
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.fr')}</Translation>,
  },
];

const timeZones = [
  {
    label: 'Canada/Newfoundland',
    value: 'Canada/Newfoundland',
  },
  {
    label: 'Canada/Atlantic',
    value: 'Canada/Atlantic',
  },
  {
    label: 'Canada/Eastern',
    value: 'Canada/Eastern',
  },
  {
    label: 'Canada/Central',
    value: 'Canada/Central',
  },
  {
    label: 'Canada/Mountain',
    value: 'Canada/Mountain',
  },
  {
    label: 'Canada/Saskatchewan',
    value: 'Canada/Saskatchewan',
  },
  {
    label: 'Canada/Yukon',
    value: 'Canada/Yukon',
  },
  {
    label: 'Canada/Pacific',
    value: 'Canada/Pacific',
  },
];

const dateFormats = [
  {
    label: 'MM/DD/YYYY',
    value: 'MM/DD/YYYY',
  },
  {
    label: 'DD/MM/YYYY',
    value: 'DD/MM/YYYY',
  },
  {
    label: 'YYYY/MM/DD',
    value: 'YYYY/MM/DD',
  },
  {
    label: 'YYYY-MM-DD',
    value: 'YYYY-MM-DD',
  },
  {
    label: 'DD-MM-YYYY',
    value: 'DD-MM-YYYY',
  },
  { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
];

export const STATIC_FILTERS = {
  EVENT: [
    {
      label: <Translation>{(t) => t('dashboard.events.filter.publication.label')}</Translation>,
      value: 'publication',
      disabled: true,
    },
    {
      label: <Translation>{(t) => t('dashboard.events.filter.users.label')}</Translation>,
      value: 'users',
      disabled: true,
    },
    {
      label: <Translation>{(t) => t('dashboard.events.filter.dates.dates')}</Translation>,
      value: 'dates',
      disabled: true,
    },
    {
      label: <Translation>{(t) => t('dashboard.events.filter.organizer.label')}</Translation>,
      value: 'organizer',
      disabled: true,
    },
  ],
  ORGANIZATION: [],
  PEOPLE: [],
  PLACE: [],
  FILTER_LIST: {
    EVENT: ['publication', 'users', 'dates', 'organizer'],
    ORGANIZATION: [],
    PEOPLE: [],
    PLACE: [],
  },
};

const REQUIRED_MESSAGE = {
  required: true,
  message: <Trans i18nKey="common.validations.informationRequired" />,
};

export const calendarSettingsFormFields = {
  GENERAL_SETTINGS: [
    {
      name: 'calendarName',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.calendarName')}</Translation>,
      field: ({ t }) => (
        <BilingualInput>
          <Form.Item name="calendarNameFr">
            <TextArea
              autoSize
              style={{
                borderRadius: '4px',
                border: '4px solid #E8E8E8',
                width: '100%',
              }}
              size="large"
              autoComplete="off"
              placeholder={t('dashboard.settings.calendarSettings.placeholders.calendarNameFr')}
              data-cy="input-calendar-name"
            />
          </Form.Item>

          <Form.Item name="calendarNameEn">
            <TextArea
              autoSize
              style={{
                borderRadius: '4px',
                border: '4px solid #E8E8E8',
                width: '100%',
              }}
              size="large"
              autoComplete="off"
              placeholder={t('dashboard.settings.calendarSettings.placeholders.calendarNameEn')}
              data-cy="input-calendar-name"
            />
          </Form.Item>
        </BilingualInput>
      ),
      rules: [
        ({ getFieldValue }) => ({
          validator() {
            if (getFieldValue('calendarNameFr') || getFieldValue('calendarNameEn')) {
              return Promise.resolve();
            } else return Promise.reject(new Error(REQUIRED_MESSAGE.message));
          },
        }),
      ],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarLanguage',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.calendarLanguage')}</Translation>,
      field: ({ t }) => (
        <TreeSelectOption
          showSearch={false}
          allowClear
          treeDefaultExpandAll
          placeholder={t('dashboard.settings.calendarSettings.placeholders.calendarLanguage')}
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={calendarLanguages}
          data-cy="treeselect-calendar-language"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            return (
              <Tags
                data-cy={`tag-calendar-language-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      ),
      rules: [REQUIRED_MESSAGE],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarTimeZone',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.timezone')}</Translation>,
      field: ({ t }) => (
        <Select
          options={timeZones}
          data-cy="select-calendar-time-zone"
          placeholder={t('dashboard.settings.calendarSettings.placeholders.timezone')}
        />
      ),
      rules: [REQUIRED_MESSAGE],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarContactEmail',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.contact')}</Translation>,
      field: () => (
        <StyledInput
          placeholder={(t) => t('dashboard.settings.calendarSettings.placeholders.contact')}
          data-cy="input-calendar-contact-email"
        />
      ),
      rules: [
        {
          type: 'email',
          message: <Trans i18nKey="login.validations.invalidEmail" />,
        },
      ],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarDateFormat',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.dateFormat')}</Translation>,
      field: ({ t }) => (
        <Select
          options={dateFormats}
          data-cy="select-calendar-date-formats"
          placeholder={t('dashboard.settings.calendarSettings.placeholders.dateFormatDisplay')}
        />
      ),
      rules: [REQUIRED_MESSAGE],
      hidden: true,
      required: false,
    },
    {
      name: '',
      label: (
        <Translation>{(t) => t('dashboard.settings.calendarSettings.imageAspectRatio.imageAspectRatio')}</Translation>
      ),
      field: ({
        t,
        aspectRatios,
        //  customRatio, setCustomRatio, setAspectRatioOptions
      }) => {
        //Custom aspect ratio has been removed as per https://github.com/culturecreates/footlight-app/issues/635#issuecomment-2073409623

        // const addItem = (e, type) => {
        //   e.preventDefault();
        //   if (aspectRatios.find((item) => item.value === customRatio[type])) return;
        //   else
        //     setAspectRatioOptions([
        //       ...aspectRatios,
        //       { label: customRatio[type], value: customRatio[type], title: customRatio[type] },
        //     ]);
        //   setCustomRatio({
        //     large: '',
        //     thumbnail: '',
        //   });
        // };
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageAspectRatio', 'large']}
                className="calendar-settings-small-label"
                label={t('dashboard.settings.calendarSettings.imageAspectRatio.large')}
                rules={[REQUIRED_MESSAGE]}
                data-cy="form-item-image-ratio-large">
                <TreeSelectOption
                  size="large"
                  multiple={false}
                  showSearch={true}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageAspectRatio')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={aspectRatios}
                  // dropdownRender={(menu) => (
                  //   <>
                  //     {menu}
                  //     <Divider style={{ margin: '8px 0' }} />
                  //     <Space style={{ padding: '0 8px 4px' }}>
                  //       <StyledInput
                  //         value={customRatio.large}
                  //         onChange={(e) =>
                  //           setCustomRatio({
                  //             ...customRatio,
                  //             large: e.target.value,
                  //           })
                  //         }
                  //       />
                  //       <Button type="text" icon={<PlusOutlined />} onClick={(e) => addItem(e, 'large')}>
                  //         {t('dashboard.settings.calendarSettings.imageAspectRatio.custom')}
                  //       </Button>
                  //     </Space>
                  //   </>
                  // )}
                  data-cy="treeselect-calendar-image-aspect-ratio"
                  tagRender={(props) => {
                    const { closable, onClose, label } = props;
                    return (
                      <Tags
                        data-cy={`tag-calendar-image-aspect-ratio-${label}`}
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['imageAspectRatio', 'thumbnail']}
                className="calendar-settings-small-label"
                label={t('dashboard.settings.calendarSettings.imageAspectRatio.thumbnail')}
                data-cy="form-item-image-ratio-thumbnail"
                rules={[REQUIRED_MESSAGE]}>
                <TreeSelectOption
                  size="large"
                  multiple={false}
                  showSearch={true}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageAspectRatio')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={aspectRatios}
                  // dropdownRender={(menu) => (
                  //   <>
                  //     {menu}
                  //     <Divider style={{ margin: '8px 0' }} />
                  //     <Space style={{ padding: '0 8px 4px' }}>
                  //       <StyledInput
                  //         value={customRatio.thumbnail}
                  //         onChange={(e) =>
                  //           setCustomRatio({
                  //             ...customRatio,
                  //             thumbnail: e.target.value,
                  //           })
                  //         }
                  //       />
                  //       <Button type="text" icon={<PlusOutlined />} onClick={(e) => addItem(e, 'thumbnail')}>
                  //         {t('dashboard.settings.calendarSettings.imageAspectRatio.custom')}
                  //       </Button>
                  //     </Space>
                  //   </>
                  // )}
                  data-cy="treeselect-calendar-filter-events"
                  tagRender={(props) => {
                    const { closable, onClose, label } = props;
                    return (
                      <Tags
                        data-cy={`tag-calendar-filter-${label}`}
                        closable={closable}
                        onClose={onClose}
                        closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                        {label}
                      </Tags>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        );
      },
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: '',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.imageMaxWidth')}</Translation>,
      field: ({ t }) => {
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageMaxWidth', 'large']}
                className="calendar-settings-small-label"
                label={<Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.large')}</Translation>}
                data-cy="form-item-image-max-width-large"
                rules={[REQUIRED_MESSAGE]}>
                <StyledInput
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageMaxWidth')}
                  data-cy="input-calendar-image-max-width-large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['imageMaxWidth', 'thumbnail']}
                className="calendar-settings-small-label"
                label={t('dashboard.settings.calendarSettings.imageMaxWidth.thumbnail')}
                data-cy="form-item-image-max-width-thumbnail"
                rules={[REQUIRED_MESSAGE]}>
                <StyledInput
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageMaxWidth')}
                  data-cy="input-calendar-image-max-width-thumbnail"
                />
              </Form.Item>
            </Col>
          </Row>
        );
      },
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarLogo',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.calendarLogo')}</Translation>,
      field: ({ form, isCrop, logoUri, t }) => (
        <>
          <Row>
            <Col>
              <p className="calendar-settings-description" data-cy="para-calendar-image-upload-sub-text">
                {t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}
              </p>
            </Col>
          </Row>
          <ImageUpload
            imageUrl={logoUri}
            originalImageUrl={logoUri}
            imageReadOnly={false}
            preview={true}
            setImageCropOpen={false}
            imageCropOpen={false}
            form={form}
            largeAspectRatio={null}
            thumbnailAspectRatio={null}
            isCrop={isCrop}
          />
        </>
      ),
      rules: [],
      hidden: false,
      required: false,
    },
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.readOnly.title')}</Translation>,
      field: ({ t }) => (
        <Row justify={'start'} align={'top'} gutter={[8, 0]}>
          <Col>
            <p className="calendar-settings-description">
              <Translation>{(t) => t('dashboard.settings.calendarSettings.readOnly.description')}</Translation>
            </p>
          </Col>
          <Col span={3}>
            <Form.Item valuePropName="checked" name="readOnly">
              <StyledSwitch />
            </Form.Item>
          </Col>
          <Col>
            <span
              style={{ color: '#222732', minHeight: '32px', display: 'flex', alignItems: 'center' }}
              data-cy="span-featured-event-text">
              {t('dashboard.settings.calendarSettings.readOnly.readOnlyMode')}
            </span>
          </Col>
        </Row>
      ),
      rules: [],
    },
  ],
  WIDGET_SETTINGS: [
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplate')}</Translation>,
      name: 'eventTemplate',
      field: ({ t }) => (
        <StyledInput
          addonBefore="URL"
          autoComplete="off"
          placeholder={t('dashboard.settings.calendarSettings.placeholders.eventTemplate')}
          data-cy="input-event-template"
        />
      ),
      required: true,
      extra: (
        <p className="calendar-settings-description">
          <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplateDescription')}</Translation>
        </p>
      ),
      rules: [
        {
          type: 'url',
          message: <Trans i18nKey="dashboard.events.addEditEvent.validations.url" />,
        },
        REQUIRED_MESSAGE,
      ],
    },
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplate')}</Translation>,
      name: 'searchResultTemplate',
      field: ({ t }) => (
        <StyledInput
          addonBefore="URL"
          autoComplete="off"
          placeholder={t('dashboard.settings.calendarSettings.placeholders.searchResultTemplate')}
          data-cy="input-search-result-template"
        />
      ),
      extra: (
        <p className="calendar-settings-description">
          <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplateDescription')}</Translation>
        </p>
      ),
      rules: [
        {
          type: 'url',
          message: <Trans i18nKey="dashboard.events.addEditEvent.validations.url" />,
        },
      ],
    },
  ],
  FILTER_PERSONALIZATION: [
    {
      name: entitiesClass.event,
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.events')}</Translation>,
      initialValue: STATIC_FILTERS.EVENT.map((item) => item.value),
      field: ({ eventFilters, t }) => (
        <TreeSelectOption
          treeData={eventFilters?.concat(STATIC_FILTERS.EVENT)}
          showSearch={false}
          treeDefaultExpandAll
          placeholder={t('dashboard.settings.calendarSettings.placeholders.filterPersonalization')}
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          data-cy="treeselect-calendar-filter-events"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            return (
              <Tags
                data-cy={`tag-calendar-filter-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      ),
      rules: [],
      hidden: false,
      required: false,
    },
    {
      name: entitiesClass.place,
      initialValue: [],
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.places')}</Translation>,
      field: ({ placeFilters, t }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={t('dashboard.settings.calendarSettings.placeholders.filterPersonalization')}
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={placeFilters?.concat(STATIC_FILTERS.PLACE)}
          data-cy="treeselect-calendar-filter-places"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            return (
              <Tags
                data-cy={`tag-calendar-filter-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      ),
      rules: [],
      hidden: false,
      required: false,
    },
    {
      name: entitiesClass.organization,
      initialValue: [],
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.organizations')}</Translation>,
      field: ({ organizationFilters, t }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={t('dashboard.settings.calendarSettings.placeholders.filterPersonalization')}
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={organizationFilters?.concat(STATIC_FILTERS.ORGANIZATION)}
          data-cy="treeselect-calendar-filter-organizations"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            return (
              <Tags
                data-cy={`tag-calendar-filter-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      ),
      rules: [],
      hidden: false,
      required: false,
    },
    {
      name: entitiesClass.person,
      initialValue: [],
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.people')}</Translation>,
      field: ({ peopleFilters, t }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={t('dashboard.settings.calendarSettings.placeholders.filterPersonalization')}
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          treeData={peopleFilters?.concat(STATIC_FILTERS.PEOPLE)}
          data-cy="treeselect-calendar-filter-people"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            return (
              <Tags
                data-cy={`tag-calendar-filter-${label}`}
                closable={closable}
                onClose={onClose}
                closeIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '12px' }} />}>
                {label}
              </Tags>
            );
          }}
        />
      ),
      rules: [],
      hidden: false,
      required: false,
    },
  ],
};
