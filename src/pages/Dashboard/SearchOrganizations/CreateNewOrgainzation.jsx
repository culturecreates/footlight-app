import { Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import EntityCard from '../../../components/Card/Common/EntityCard';
import NoContent from '../../../components/NoContent/NoContent';
import EventsSearch from '../../../components/Search/Events/EventsSearch';
import NewEntityLayout from '../../../layout/CreateNewEntity/NewEntityLayout';
import logo from '../../../assets/icons/Taxonomy.svg';
import './createNew.css';

function CreateNewOrgainzation() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);

  useEffect(() => {
    setOrganizationList([]);
  }, []);

  const heading = 'New Organization';
  const entityName = 'Organization';
  const text =
    'Search to link to an existing instance of the organization. If you don’t find the organization, you can create it.';

  return (
    <NewEntityLayout heading={heading} entityName={entityName} text={text}>
      <div className="search-bar-organization">
        <Popover
          open={isPopoverOpen}
          arrow={false}
          overlayClassName="event-popover"
          placement="bottom"
          onOpenChange={(open) => setIsPopoverOpen(open)}
          autoAdjustOverflow={false}
          getPopupContainer={(trigger) => trigger.parentNode}
          trigger={['click']}
          content={
            <div>
              <div className="search-scrollable-content">
                {organizationList?.length > 0 ? (
                  organizationList?.map((organizer, index) => (
                    <div
                      key={index}
                      className="search-popover-options"
                      onClick={() => {
                        setSelectedOrganizers([...selectedOrganizers, organizer]);
                        setIsPopoverOpen(false);
                      }}>
                      <EntityCard
                        title={organizer.organizationName}
                        description={organizer.smallDescription}
                        artsDataLink={organizer.dummyLink}
                        imageUrl={logo}
                      />
                    </div>
                  ))
                ) : (
                  <NoContent />
                )}
              </div>
            </div>
          }>
          <EventsSearch
            style={{ borderRadius: '4px' }}
            placeHolder="Search organizations"
            onClick={() => {
              setIsPopoverOpen(!isPopoverOpen);
            }}
          />
        </Popover>
      </div>
    </NewEntityLayout>
  );
}

export default CreateNewOrgainzation;
