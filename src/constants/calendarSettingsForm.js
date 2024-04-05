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
};

const REQUIRED_MESSAGE = {
  required: true,
  message: <Trans i18nKey="common.validations.informationRequired" />,
};

const aspectRatios = [
  {
    label: '1:1',
    value: '1:1',
  },
  {
    label: '2:3',
    value: '2:3',
  },
  {
    label: '4:3',
    value: '4:3',
  },
  {
    label: '5:4',
    value: '5:4',
  },
  {
    label: '16:9',
    value: '16:9',
  },
];

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
      hidden: false,
      required: true,
    },
    {
      name: 'imageAspectRatio',
      label: (
        <Translation>{(t) => t('dashboard.settings.calendarSettings.imageAspectRatio.imageAspectRatio')}</Translation>
      ),
      field: ({ t }) => {
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageAspectRatio', 'large']}
                label={t('dashboard.settings.calendarSettings.imageAspectRatio.large')}
                rules={[REQUIRED_MESSAGE]}
                data-cy="form-item-image-ratio-large">
                <TreeSelectOption
                  size="large"
                  multiple={false}
                  showSearch={false}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageAspectRatio')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={aspectRatios}
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
                label={t('dashboard.settings.calendarSettings.imageAspectRatio.thumbnail')}
                data-cy="form-item-image-ratio-thumbnail"
                rules={[REQUIRED_MESSAGE]}>
                <TreeSelectOption
                  size="large"
                  multiple={false}
                  showSearch={false}
                  allowClear
                  treeDefaultExpandAll
                  placeholder={t('dashboard.settings.calendarSettings.placeholders.imageAspectRatio')}
                  notFoundContent={<NoContent />}
                  clearIcon={<CloseCircleOutlined style={{ color: '#1b3de6', fontSize: '14px' }} />}
                  treeData={aspectRatios}
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
      field: ({ t }) => {
        return (
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                name={['imageMaxWidth', 'large']}
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
  ],
  WIDGET_SETTINGS: [
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplate')}</Translation>,
      field: ({ eventTemplate, t }) => (
        <Form.Item
          name={'eventTemplate'}
          initialValue={eventTemplate}
          rules={[
            {
              type: 'url',
              message: t('dashboard.events.addEditEvent.validations.url'),
            },
            REQUIRED_MESSAGE,
          ]}
          data-cy="form-item-event-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={t('dashboard.settings.calendarSettings.placeholders.eventTemplate')}
            data-cy="input-event-template"
          />
        </Form.Item>
      ),
      required: true,
      extra: (
        <p className="calendar-settings-description">
          <Translation>{(t) => t('dashboard.settings.calendarSettings.eventTemplateDescription')}</Translation>
        </p>
      ),
    },
    {
      label: <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplate')}</Translation>,
      field: ({ searchResultTemplate, t }) => (
        <Form.Item
          name={'searchResultTemplate'}
          initialValue={searchResultTemplate}
          rules={[
            {
              type: 'url',
              message: t('dashboard.events.addEditEvent.validations.url'),
            },
          ]}
          data-cy="form-item-search-result-template">
          <StyledInput
            addonBefore="URL"
            autoComplete="off"
            placeholder={t('dashboard.settings.calendarSettings.placeholders.searchResultTemplate')}
            data-cy="input-search-result-template"
          />
        </Form.Item>
      ),
      extra: (
        <p className="calendar-settings-description">
          <Translation>{(t) => t('dashboard.settings.calendarSettings.searchResultTemplateDescription')}</Translation>
        </p>
      ),
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
      name: entitiesClass.people,
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
