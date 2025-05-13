import { Translation } from 'react-i18next';
import { DeleteOutlined } from '@ant-design/icons';

export const offerTypes = {
  FREE: 'FREE',
  PAYING: 'PAYING',
  REGISTER: 'REGISTRATION',
};

export const offerTypeOptions = [
  {
    type: offerTypes.FREE,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToFree')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToFreeTooltip')}</Translation>,
    validateFields: [],
    removeFields: [],
  },
  {
    type: offerTypes.PAYING,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToPaid')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToPaidTooltip')}</Translation>,
    validateFields: ['ticketPickerWrapper', 'prices', 'ticketLink', 'ticketNote'],
    removeFields: [],
  },
  {
    type: offerTypes.REGISTER,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToRegister')}</Translation>,
    tooltip: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.changeToRegisterTooltip')}</Translation>,
    validateFields: ['ticketPickerWrapper', 'prices', 'registerLink', 'ticketNote'],
    removeFields: [],
  },
  {
    type: null,
    disabled: false,
    label: <Translation>{(t) => t('dashboard.events.addEditEvent.tickets.removeOffer')}</Translation>,
    secondaryIcon: <DeleteOutlined data-cy="icon-delete-offer" />,
    validateFields: [],
    removeFields: ['ticketPickerWrapper', 'prices', 'registerLink', 'ticketNote', 'ticketLink'],
  },
];
