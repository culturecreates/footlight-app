import { Translation } from 'react-i18next';
import StyledInput from '../components/Input/Common';
import NoContent from '../components/NoContent/NoContent';
import Tags from '../components/Tags/Common/Tags';
import { CloseCircleOutlined } from '@ant-design/icons';
import TreeSelectOption from '../components/TreeSelectOption';
import Select from '../components/Select';
import { Col, Form, Row } from 'antd';
import ImageUpload from '../components/ImageUpload';

const calendarLanguages = [
  {
    value: 'ENGLISH',
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.en')}</Translation>,
  },
  {
    value: 'FRENCH',
    label: <Translation>{(t) => t('dashboard.settings.addUser.dropDownOptions.langagePreference.fr')}</Translation>,
  },
  {
    value: 'BILINGUAL',
    label: 'BILINGUAL',
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

const STATIC_FILTERS = {
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
};

export const calendarSettingsFormFields = {
  GENERAL_SETTINGS: [
    {
      name: 'calendarName',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.calendarName')}</Translation>,
      field: () => (
        <StyledInput
          autoComplete="off"
          placeholder={<Translation>{(t) => t('dashboard.settings.calendarSettings.calendarName')}</Translation>}
          data-cy="input-calendar-name"
        />
      ),
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarLanguage',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.calendarLanguage')}</Translation>,
      field: () => (
        <TreeSelectOption
          showSearch={false}
          allowClear
          treeDefaultExpandAll
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
            </Translation>
          }
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
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarTimeZone',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.timezone')}</Translation>,
      field: () => <Select options={timeZones} data-cy="select-calendar-time-zone" />,
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarContactEmail',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.contact')}</Translation>,
      field: () => (
        <StyledInput
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.contact.placeHolderEmail')}
            </Translation>
          }
          data-cy="input-calendar-contact-email"
        />
      ),
      rules: [
        {
          type: 'email',
          message: <Translation>{(t) => t('login.validations.invalidEmail')}</Translation>,
        },
      ],
      hidden: false,
      required: true,
    },
    {
      name: 'calendarDateFormat',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.dateFormat')}</Translation>,
      field: () => <Select options={dateFormats} data-cy="select-calendar-date-formats" />,
      rules: [],
      hidden: false,
      required: true,
    },
    {
      name: 'imageAspectRatio',
      label: (
        <Translation>{(t) => t('dashboard.settings.calendarSettings.imageAspectRatio.imageAspectRatio')}</Translation>
      ),
      field: () => {
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageAspectRatio', 'large']}
                label={
                  <Translation>{(t) => t('dashboard.settings.calendarSettings.imageAspectRatio.large')}</Translation>
                }
                data-cy="form-item-image-ratio-large">
                <TreeSelectOption
                  multiple={false}
                  showSearch={false}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={
                    <Translation>
                      {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
                    </Translation>
                  }
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={calendarLanguages}
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
            <Col span={12}>
              <Form.Item
                name={['imageAspectRatio', 'thumbnail']}
                label={
                  <Translation>
                    {(t) => t('dashboard.settings.calendarSettings.imageAspectRatio.thumbnail')}
                  </Translation>
                }
                data-cy="form-item-image-ratio-thumbnail">
                <TreeSelectOption
                  multiple={false}
                  showSearch={false}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={
                    <Translation>
                      {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
                    </Translation>
                  }
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={calendarLanguages}
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
      name: 'imageMaxWidth',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.imageMaxWidth')}</Translation>,
      field: () => {
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageMaxWidth', 'large']}
                label={<Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.large')}</Translation>}
                data-cy="form-item-image-max-width-large">
                <StyledInput
                  placeholder={
                    <Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.large')}</Translation>
                  }
                  data-cy="input-calendar-image-max-width-large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['imageMaxWidth', 'thumbnail']}
                label={
                  <Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.thumbnail')}</Translation>
                }
                data-cy="form-item-image-max-width-thumbnail">
                <StyledInput
                  placeholder={
                    <Translation>{(t) => t('dashboard.settings.calendarSettings.imageMaxWidth.thumbnail')}</Translation>
                  }
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
      field: ({ form, isCrop, logoUri }) => (
        <>
          <Row>
            <Col>
              <p data-cy="para-calendar-image-upload-sub-text">
                <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.image.subHeading')}</Translation>
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
  ],
  WIDGET_SETTINGS: [
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplate')}</Translation>,
      field: ({ eventTemplate }) => (
        <Form.Item
          name={'eventTemplate'}
          initialValue={eventTemplate}
          rules={[
            {
              type: 'url',
              message: <Translation>{(t) => t('dashboard.events.addEditEvent.validations.url')}</Translation>,
            },
          ]}
          data-cy="form-item-event-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={
              <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}</Translation>
            }
            data-cy="input-event-template"
          />
        </Form.Item>
      ),
      required: true,
      extra: <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplateDescription')}</Translation>,
    },
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplate')}</Translation>,
      field: ({ searchResultTemplate }) => (
        <Form.Item
          name={'searchResultTemplate'}
          initialValue={searchResultTemplate}
          rules={[
            {
              type: 'url',
              message: <Translation>{(t) => t('dashboard.events.addEditEvent.validations.url')}</Translation>,
            },
          ]}
          data-cy="form-item-search-result-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={
              <Translation>{(t) => t('dashboard.events.addEditEvent.otherInformation.placeHolderLinks')}</Translation>
            }
            data-cy="input-search-result-template"
          />
        </Form.Item>
      ),
      extra: (
        <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplateDescription')}</Translation>
      ),
    },
  ],
  FILTER_PERSONALIZATION: [
    {
      name: 'events',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.events')}</Translation>,
      initialValue: STATIC_FILTERS.EVENT.map((item) => item.value),
      field: ({ eventFilters }) => (
        <TreeSelectOption
          treeData={eventFilters?.concat(STATIC_FILTERS.EVENT)}
          showSearch={false}
          treeDefaultExpandAll
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
            </Translation>
          }
          notFoundContent={<NoContent />}
          clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
          data-cy="treeselect-calendar-filter-events"
          tagRender={(props) => {
            const { closable, onClose, label } = props;
            console.log(props);
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
      name: 'places',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.places')}</Translation>,
      field: ({ placeFilters }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
            </Translation>
          }
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
      name: 'organizations',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.organizations')}</Translation>,
      field: ({ organizationFilters }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
            </Translation>
          }
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
      name: 'people',
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.people')}</Translation>,
      field: ({ peopleFilters }) => (
        <TreeSelectOption
          showSearch={false}
          treeDefaultExpandAll
          placeholder={
            <Translation>
              {(t) => t('dashboard.events.addEditEvent.otherInformation.eventLanguagePlaceholder')}
            </Translation>
          }
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
