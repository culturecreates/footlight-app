import { Translation } from 'react-i18next';

export const addressTypeOptionsFieldNames = {
  OPENING_HOURS: 'openingHours',
};
export const addressTypeOptions = [
  {
    type: 'openingHours',
    fieldNames: addressTypeOptionsFieldNames.OPENING_HOURS,
    disabled: false,
    label: (
      <>
        <Translation>
          {(t) => {
            return (
              <>
                {t('dashboard.places.createNew.addPlace.address.openingHours.openingHours1')}
                <br />
                {t('dashboard.places.createNew.addPlace.address.openingHours.openingHours2')}
              </>
            );
          }}
        </Translation>
      </>
    ),
    tooltip: <Translation>{(t) => t('dashboard.places.createNew.addPlace.address.openingHours.tooltip')}</Translation>,
  },
];
