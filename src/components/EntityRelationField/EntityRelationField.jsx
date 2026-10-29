import React from 'react';
import { Form } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import SelectionItem from '../List/SelectionItem';
import EventsSearch from '../Search/Events/EventsSearch';
import CustomPopover from '../Popover/Popover';
import EntityPopoverSection from '../EntityImport/EntityPopoverSection';
import KeyboardAccessibleLayout from '../../layout/KeyboardAccessibleLayout/KeyboardAccessibleLayout';
import FeatureFlag from '../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../utils/featureFlags';
import { sourceOptions } from '../../constants/sourceOptions';

/**
 * Shared relation field used by AddEvent for the organizer / performer / supporter sections.
 *
 * Renders the inner `Form.Item` (name="organizers" | "performers" | "supporters") containing the
 * KeyboardAccessibleLayout + CustomPopover with the Footlight / Footlight-imports / ArtsData
 * EntityPopoverSections, the quick-create entry, the EventsSearch input, and the list of selected
 * SelectionItems. The outer labelled Form.Item wrapper, subheadings and the organizer-only
 * quick-create modals / contact field remain in AddEvent.
 *
 * Every data-cy string and structural quirk (e.g. the extra wrapping div that performer omits) is
 * passed in explicitly so the rendered DOM matches each original section byte-for-byte.
 */
const EntityRelationField = ({
  t,
  // inner Form.Item identity
  fieldName,
  fieldClassName,
  fieldDataCy,
  fieldRequired,
  rules,
  initialValue,
  // selection state
  selectedItems,
  setSelectedItems,
  // option lists
  footlightList,
  footlightImportsList,
  artsdataList,
  // popover state
  popoverKey,
  popoverDataCy,
  isPopoverOpen,
  setIsPopoverOpen,
  // search
  searchType,
  entityType,
  searchPlaceholder,
  searchInputDataCy,
  quickCreateKeyword,
  setQuickCreateKeyword,
  // data-cy for the three popover sections
  footlightHeaderDataCy,
  importsHeaderDataCy,
  artsdataHeaderDataCy,
  itemDataCyPrefix,
  // quick-create entry
  quickCreateWrapperDataCy,
  quickCreateIconDataCy,
  wrapSectionsInDiv,
  // shared deps
  isEntitiesFetching,
  isExternalSourceFetching,
  showRelationshipFootlightImportSection,
  showDialog,
  setShowDialog,
  debounceSearchOrganizationPersonSearch,
  debounceSearchExternalSourceOrganizationPerson,
  setQuickOrganizerModal,
  setSelectedOrganizerPerformerSupporterType,
  navigationHandler,
  calendarContentLanguage,
}) => {
  const selectItem = (item) => {
    setSelectedItems([...selectedItems, item]);
    setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: false });
    if (!showDialog) setShowDialog(true);
  };

  const popoverSections = (
    <>
      <EntityPopoverSection
        title={t('dashboard.organization.createNew.search.footlightSectionHeading')}
        headerDataCy={footlightHeaderDataCy}
        isLoading={isEntitiesFetching}
        hasError={false}
        items={footlightList}
        itemDataCy={(index) => `div-select-${itemDataCyPrefix}-${index}`}
        itemClassName="event-popover-options"
        onSelect={selectItem}
        renderItem={(item) => item?.label}
      />
      {showRelationshipFootlightImportSection && quickCreateKeyword !== '' && (
        <EntityPopoverSection
          title={t('dashboard.organization.createNew.search.importsFromFootlight')}
          headerDataCy={importsHeaderDataCy}
          isLoading={isExternalSourceFetching}
          hasError={false}
          items={footlightImportsList}
          itemDataCy={(index) => `div-select-import-footlight-${itemDataCyPrefix}-${index}`}
          itemClassName="event-popover-options"
          onSelect={selectItem}
          renderItem={(item) => item?.label}
        />
      )}
      {quickCreateKeyword !== '' && (
        <EntityPopoverSection
          title={t('dashboard.organization.createNew.search.artsDataSectionHeading')}
          headerDataCy={artsdataHeaderDataCy}
          isLoading={isExternalSourceFetching}
          hasError={false}
          items={artsdataList}
          itemDataCy={(index) => `div-select-artsdata-${itemDataCyPrefix}-${index}`}
          itemClassName="event-popover-options"
          onSelect={selectItem}
          renderItem={(item) => item?.label}
        />
      )}
    </>
  );

  return (
    <Form.Item
      name={fieldName}
      className={fieldClassName}
      initialValue={initialValue}
      {...(fieldRequired !== undefined && { required: fieldRequired })}
      rules={rules}
      data-cy={fieldDataCy}>
      <KeyboardAccessibleLayout
        setItem={(item) => setSelectedItems([...selectedItems, item])}
        data={[footlightList, footlightImportsList, artsdataList]}
        setFieldValue={() => {
          return;
        }}
        popOverHandler={() => setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: false })}
        isPopoverOpen={isPopoverOpen[popoverKey]}>
        <CustomPopover
          open={isPopoverOpen[popoverKey]}
          onOpenChange={(open) => {
            debounceSearchOrganizationPersonSearch(quickCreateKeyword, searchType);
            if (quickCreateKeyword !== '') {
              debounceSearchExternalSourceOrganizationPerson(quickCreateKeyword, searchType);
            }
            setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: open });
          }}
          destroyTooltipOnHide={true}
          overlayClassName="event-popover"
          placement="bottom"
          autoAdjustOverflow={false}
          getPopupContainer={(trigger) => trigger.parentNode}
          trigger={['click']}
          data-cy={popoverDataCy}
          content={
            <div>
              {wrapSectionsInDiv ? <div>{popoverSections}</div> : popoverSections}
              <FeatureFlag isFeatureEnabled={featureFlags.quickCreateOrganization}>
                {quickCreateKeyword?.length > 0 && (
                  <div
                    className="quick-create"
                    onClick={() => {
                      setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: false });
                      setQuickOrganizerModal(true);
                    }}
                    data-cy={quickCreateWrapperDataCy}>
                    <PlusCircleOutlined {...(quickCreateIconDataCy && { 'data-cy': quickCreateIconDataCy })} />
                    &nbsp;{t('dashboard.events.addEditEvent.quickCreate.create')}&nbsp;&#34;
                    {quickCreateKeyword}&#34;
                  </div>
                )}
              </FeatureFlag>
            </div>
          }>
          <EventsSearch
            style={{ borderRadius: '4px' }}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              setQuickCreateKeyword(e.target.value);
              debounceSearchOrganizationPersonSearch(e.target.value, searchType);
              if (e.target.value !== '') {
                debounceSearchExternalSourceOrganizationPerson(e.target.value, searchType);
              }
              setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: true });
            }}
            onClick={(e) => {
              setSelectedOrganizerPerformerSupporterType(entityType);
              setQuickCreateKeyword(e.target.value);
              setIsPopoverOpen({ ...isPopoverOpen, [popoverKey]: true });
            }}
            data-cy={searchInputDataCy}
          />
        </CustomPopover>
      </KeyboardAccessibleLayout>

      {selectedItems?.map((item, index) => {
        return (
          <SelectionItem
            key={index}
            icon={item?.label?.props?.icon}
            name={item?.name}
            description={item?.description}
            {...(item?.validationReport?.hasAllMandatoryFields === false && { borderColor: 'red' })}
            bordered
            closable
            itemWidth="100%"
            onClose={() => {
              setSelectedItems(selectedItems?.filter((selectedItem, indexValue) => indexValue != index));
              if (!showDialog) setShowDialog(true);
            }}
            edit={item?.source === sourceOptions.CMS && true}
            calendarContentLanguage={calendarContentLanguage}
            onEdit={(e) => navigationHandler(item?.value, item?.type, e)}
            creatorId={item?.creatorId}
            fallbackConfig={item?.fallBackStatus}
            isTransparent={item?.isTransparent}
          />
        );
      })}
    </Form.Item>
  );
};

export default EntityRelationField;
