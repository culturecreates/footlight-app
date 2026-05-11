import React, { useEffect, useRef, useState } from 'react';
import {
  LeftOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Form, message, notification, Row } from 'antd';
import PrimaryButton from '../../../components/Button/Primary';
import { createSearchParams, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import OutlinedButton from '../../..//components/Button/Outlined';
import { useTranslation } from 'react-i18next';
import FeatureFlag from '../../../layout/FeatureFlag/FeatureFlag';
import { featureFlags } from '../../../utils/featureFlags';
import './addUser.css';
import i18n from 'i18next';
import {
  useCurrentUserLeaveCalendarMutation,
  useLazyGetAllUsersQuery,
  useLazyGetCurrentUserQuery,
  useLazyGetUserByIdQuery,
  useUpdateCurrentUserMutation,
  useUpdateUserByIdMutation,
} from '../../../services/users';
import AuthenticationInput from '../../../components/Input/Common/AuthenticationInput';
import { userLanguages } from '../../../constants/userLanguages';
import { userRoles } from '../../../constants/userRoles';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, getUserDetails, setUser } from '../../../redux/reducer/userSlice';
import { contentLanguageBilingual } from '../../../utils/bilingual';
import { useOutletContext } from 'react-router-dom';
import ChangePassword from '../../../components/Modal/ChangePassword/ChangePassword';
import { useInviteUserMutation } from '../../../services/invite';
import { Confirm } from '../../../components/Modal/Confirm/Confirm';
import { setErrorStates } from '../../../redux/reducer/ErrorSlice';
import { PathName } from '../../../constants/pathName';
import { userActivityStatus } from '../../../constants/userActivityStatus';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { setReloadCalendar } from '../../../redux/reducer/selectedCalendarSlice';
import CalendarAccordion from '../../../components/Accordion/CalendarAccordion';
import { removeObjectArrayDuplicates } from '../../../utils/removeObjectArrayDuplicates';
import Select from '../../../components/Select';
import Cookies from 'js-cookie';
import { adminCheckHandler } from '../../../utils/adminCheckHandler';
import { RouteLeavingGuard } from '../../../hooks/usePrompt';
import ImageUpload from '../../../components/ImageUpload';
import { useAddImageMutation } from '../../../services/image';

const AddUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { calendarId } = useParams();
  const location = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const [formInstance] = Form.useForm();
  const [
    currentCalendarData, // eslint-disable-next-line no-unused-vars
    _pageNumber, // eslint-disable-next-line no-unused-vars
    _setPageNumber, // eslint-disable-next-line no-unused-vars
    _getCalendar,
    setContentBackgroundColor, // eslint-disable-next-line no-unused-vars
    _isReadOnly, // eslint-disable-next-line no-unused-vars
    _setIsReadOnly, // eslint-disable-next-line no-unused-vars
    _refetch,
    allCalendarsData,
  ] = useOutletContext();

  useEffect(() => {
    setContentBackgroundColor('#F9FAFF');
  }, [setContentBackgroundColor]);

  const userId = searchParams.get('id');
  const timestampRef = useRef(Date.now()).current;

  const calendarContentLanguage = currentCalendarData?.contentLanguage;

  const { accessToken, expiredTime, refreshToken, user } = useSelector(getUserDetails);

  const [isPopoverOpen, setIsPopoverOpen] = useState({
    organization: false,
    calendar: false,
    password: false,
  });
  const [selectedCalendars, setSelectedCalendars] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userType: '',
    languagePreference: '',
  });
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isExistingCmsUser, setIsExistingCmsUser] = useState(false);
  const [isFirstNameDisabled, setIsFirstNameDisabled] = useState(false);
  const [isLastNameDisabled, setIsLastNameDisabled] = useState(false);
  const [imageCropOpen, setImageCropOpen] = useState(false);
  const [profileThumbnailUrl, setProfileThumbnailUrl] = useState(null);
  const [profileImageKey, setProfileImageKey] = useState(0);
  const [profileImageDeleted, setProfileImageDeleted] = useState(false);

  const calendar = user?.roles?.filter((calendar) => {
    return calendar?.calendarId === calendarId;
  });

  const isViewingOtherUser = !!(userId && userId !== user?.id);
  const canEditPersonalInfo = !isViewingOtherUser || user?.isSuperAdmin;
  const canEditCalendarInfo = adminCheckHandler({ calendar, user });

  const mainImageData = userData?.image?.find((img) => img?.isMain) || userData?.image?.[0] || null;

  const newUserFoundImageData =
    !userId && isExistingCmsUser ? userData?.image?.find((img) => img?.isMain) || userData?.image?.[0] || null : null;

  const [getUser, { isFetching: isUserFetching }] = useLazyGetUserByIdQuery({ sessionId: timestampRef });
  const [getUserSearch] = useLazyGetAllUsersQuery({ sessionId: timestampRef });

  const [currentUserLeaveCalendar] = useCurrentUserLeaveCalendarMutation();
  const [inviteUser, { isLoading: inviteUserLoading }] = useInviteUserMutation();
  const [updateUserById, { isLoading: updateUserByIdLoading }] = useUpdateUserByIdMutation();
  const [getCurrentUserDetails, { isFetching: isCurrentUserFetching }] = useLazyGetCurrentUserQuery({
    sessionId: timestampRef,
  });
  const [updateCurrentUser, { isLoading: updateCurrentUserLoading }] = useUpdateCurrentUserMutation();
  const [addImage, { isLoading: imageUploadLoading }] = useAddImageMutation();
  const isSaving =
    inviteUserLoading ||
    updateUserByIdLoading ||
    updateCurrentUserLoading ||
    isUserFetching ||
    isCurrentUserFetching ||
    imageUploadLoading;

  useEffect(() => {
    setSelectedCalendars([]);

    if (userId !== user?.id) {
      !adminCheckHandler({ calendar, user }) &&
        dispatch(setErrorStates({ errorCode: '403', isError: true, message: 'Forbidden resource.' }));
    } else {
      setIsCurrentUser(true);
    }

    if (userId && userId !== user?.id) {
      getUser({ userId, calendarId, sessionId: timestampRef })
        .unwrap()
        .then((response) => {
          const activeCalendars = response?.roles?.filter((r) => {
            return r.status === userActivityStatus[0].key || r.status === userActivityStatus[2].key;
          });
          const viewerAdminCalendarIds =
            user?.roles
              ?.filter((r) => r.role === userRoles.ADMIN && r.status === userActivityStatus[0].key)
              ?.map((r) => r.calendarId) ?? [];
          const visibleCalendars = user?.isSuperAdmin
            ? activeCalendars
            : activeCalendars?.filter((c) => viewerAdminCalendarIds.includes(c.calendarId));
          setSelectedCalendars(
            visibleCalendars
              ?.map((calendar) => ({
                ...calendar,
                disabled: calendarId === calendar?.calendarId ? false : true,
              }))
              .sort((a, b) => a.disabled - b.disabled),
          );
          const requiredRole = response?.roles.filter((r) => {
            return r.calendarId === calendarId;
          });

          setUserData({
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
            email: response?.email,
            userType: requiredRole[0]?.role,
            languagePreference: response.interfaceLanguage,
            calendars: response.roles,
            ...response,
          });
        });
    } else if (userId && userId === user?.id) {
      getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
        .unwrap()
        .then((response) => {
          const activeCalendars = response?.roles.filter((r) => {
            return r.status == userActivityStatus[0].key || r.status == userActivityStatus[2].key;
          });
          setSelectedCalendars(
            activeCalendars
              ?.map((calendar) => ({
                ...calendar,
                disabled: false,
              }))
              .sort((a, b) => a.disabled - b.disabled),
          );
          const requiredRole = response?.roles.filter((r) => {
            return r.calendarId === calendarId;
          });
          setUserData({
            firstName: response?.firstName,
            lastName: response?.lastName,
            phoneNumber: response?.phoneNumber,
            email: response?.email,
            userType: requiredRole[0]?.role,
            languagePreference: response.interfaceLanguage,
            calendars: response.roles,
            ...response,
          });
        });
    } else if (!userId) {
      if (user?.isSuperAdmin) {
        setSelectedCalendars(
          allCalendarsData
            ?.map((calendar) => ({
              ...calendar,
              calendarId: calendar.id,
              disabled: calendarId === calendar?.id ? false : true,
              role: userRoles.GUEST,
            }))
            .sort((a, b) => a.disabled - b.disabled),
        );
      } else
        getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
          .unwrap()
          .then((response) => {
            setSelectedCalendars(
              response?.roles
                .map((calendar) => ({
                  ...calendar,
                  disabled: calendarId === calendar?.calendarId ? false : true,
                }))
                .sort((a, b) => a.disabled - b.disabled),
            );
          });
    } else if (location.state?.data) {
      setSearchParams(createSearchParams({ id: location.state.data.id }));
    }
  }, [userId, allCalendarsData]);

  useEffect(() => {
    if (userId) {
      formInstance.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        languagePreference: userData.languagePreference,
      });
    }
  }, [userData]);

  useEffect(() => {
    setProfileImageDeleted(false);
    if (mainImageData) {
      setProfileThumbnailUrl(mainImageData.thumbnail?.uri || mainImageData.large?.uri || null);
    } else {
      setProfileThumbnailUrl(null);
    }
  }, [userData.image]);

  // handlers

  const validateNotEmpty = (_, value, message) => {
    if (value === '') {
      return Promise.reject(new Error(message));
    } else {
      return Promise.resolve();
    }
  };

  const onEmailBlur = (e) => {
    if (userId) return;
    const email = e.target.value?.trim();
    if (!email || !email.includes('@')) return;

    getUserSearch({ includeCalenderFilter: false, calendarId, query: email, page: 1, limit: 10, filters: '' })
      .unwrap()
      .then((res) => {
        const foundUser = res?.data?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!foundUser) {
          setIsExistingCmsUser(false);
          setIsFirstNameDisabled(false);
          setIsLastNameDisabled(false);
          return;
        }
        getUser({ userId: foundUser._id, calendarId })
          .unwrap()
          .then((response) => {
            let activeCalendars = response?.roles?.filter((r) => r.status === userActivityStatus[0].key) ?? [];
            const viewerAdminCalendarIds =
              user?.roles
                ?.filter((r) => r.role === userRoles.ADMIN && r.status === userActivityStatus[0].key)
                ?.map((r) => r.calendarId) ?? [];
            activeCalendars = user?.isSuperAdmin
              ? activeCalendars
              : activeCalendars.filter((c) => viewerAdminCalendarIds.includes(c.calendarId));
            const currentCalendarRole = {
              calendarId: currentCalendarData?.id,
              image: currentCalendarData?.image,
              name: currentCalendarData?.name,
              role: userRoles.GUEST,
            };
            activeCalendars = removeObjectArrayDuplicates([...activeCalendars, currentCalendarRole], 'calendarId');
            setSelectedCalendars(
              activeCalendars
                .map((cal) => ({ ...cal, disabled: calendarId === cal?.calendarId ? false : true }))
                .sort((a, b) => a.disabled - b.disabled),
            );
            setUserData({
              firstName: response?.firstName,
              lastName: response?.lastName,
              phoneNumber: response?.phoneNumber,
              email: response?.email,
              languagePreference: response?.interfaceLanguage,
              calendars: response?.roles,
              ...response,
            });
            setIsExistingCmsUser(true);
            setIsFirstNameDisabled(!!response?.firstName);
            setIsLastNameDisabled(!!response?.lastName);
            const imgData = response?.image?.find((img) => img?.isMain) || response?.image?.[0] || null;
            setProfileThumbnailUrl(imgData?.thumbnail?.uri || imgData?.large?.uri || null);
          })
          .catch(() => setIsExistingCmsUser(false));
      })
      .catch(() => setIsExistingCmsUser(false));
  };

  const onSaveHandler = () => {
    if (!userId) {
      formInstance
        .validateFields()
        .then((values) => {
          setIsFormDirty(false);
          let organizations = values?.organizers[calendarId];
          organizations = organizations?.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let people = values?.people[calendarId];
          people = people?.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let places = values?.places?.[calendarId];
          places = places?.map((place) => {
            return { entityId: place?.value };
          });

          let userType = values?.userType[calendarId];
          inviteUser({
            firstName: values.firstName?.trim(),
            lastName: values.lastName?.trim(),
            email: values.email,
            role: userType,
            language: values?.languagePreference,
            calendarId,
            organizationIds: organizations,
            peopleIds: people,
            places,
          })
            .unwrap()
            .then((res) => {
              if (res?.data?.statusCode == 202) {
                notification.success({
                  description: t(`dashboard.settings.addUser.notification.invitation`),
                  key: res.message,
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
              }
              navigate(-2);
            });
        })
        .catch((errors) => {
          notification.success({
            description: errors.message,
            key: errors.message,
            placement: 'top',
            closeIcon: <></>,
            maxCount: 1,
            duration: 3,
          });
        });
    } else if (userId) {
      formInstance
        .validateFields()
        .then(async (values) => {
          setIsFormDirty(false);

          const buildImagePayload = async () => {
            const profilePictureFiles = values?.profilePicture;
            const imageCropData = formInstance.getFieldValue('imageCrop');
            if (profilePictureFiles?.[0]?.originFileObj) {
              const formdata = new FormData();
              formdata.append('file', profilePictureFiles[0].originFileObj);
              const response = await addImage({ data: formdata, calendarId }).unwrap();
              const entityId = response?.data?.original?.entityId;
              return [
                {
                  large: imageCropData?.large
                    ? {
                        xCoordinate: imageCropData.large.x,
                        yCoordinate: imageCropData.large.y,
                        height: imageCropData.large.height,
                        width: imageCropData.large.width,
                      }
                    : undefined,
                  thumbnail: imageCropData?.thumbnail
                    ? {
                        xCoordinate: imageCropData.thumbnail.x,
                        yCoordinate: imageCropData.thumbnail.y,
                        height: imageCropData.thumbnail.height,
                        width: imageCropData.thumbnail.width,
                      }
                    : undefined,
                  original: { entityId, height: response?.data?.height, width: response?.data?.width },
                  isMain: true,
                },
              ];
            } else if (Array.isArray(profilePictureFiles) && profilePictureFiles.length === 0) {
              return [];
            }
            return undefined;
          };

          const imagePayload = await buildImagePayload();
          const imagePatch = imagePayload !== undefined ? { image: imagePayload } : {};
          let organizations = values?.organizers?.[calendarId] ?? [];
          organizations = organizations.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let people = values?.people?.[calendarId] ?? [];
          people = people.map((organizer) => {
            return { entityId: organizer?.value };
          });

          let places = values?.places?.[calendarId] ?? [];
          places = places.map((place) => {
            return { entityId: place?.value };
          });

          let userType = values?.userType?.[calendarId] ?? [];

          const warningHandler = (error) => {
            message.warning({
              duration: 10,
              maxCount: 1,
              key: 'udpate-user-warning',
              content: (
                <>
                  {error?.data?.message} &nbsp;
                  <Button
                    type="text"
                    icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
                    onClick={() => message.destroy('udpate-user-warning')}
                  />
                </>
              ),
              icon: <ExclamationCircleOutlined />,
            });
          };

          const refreshCurrentUserState = (values) => {
            i18n.changeLanguage(values?.languagePreference?.toLowerCase());
            getCurrentUserDetails({ accessToken: accessToken, calendarId: calendarId })
              .unwrap()
              .then((response) => {
                const requiredRole = response?.roles.filter((r) => r.calendarId === calendarId);
                setUserData({
                  firstName: response?.firstName,
                  lastName: response?.lastName,
                  email: response?.email,
                  userType: requiredRole[0]?.role,
                  userName: response?.userName,
                  languagePreference: response.interfaceLanguage,
                  calendars: response.roles,
                });
                dispatch(
                  setUser({
                    accessToken,
                    expiredTime,
                    refreshToken,
                    user: {
                      id: response?.id,
                      firstName: response?.firstName,
                      lastName: response?.lastName,
                      email: response?.email,
                      profileImage:
                        response?.profileImage ??
                        response?.image?.find((img) => img?.isMain)?.thumbnail?.uri ??
                        response?.image?.[0]?.thumbnail?.uri ??
                        null,
                      roles: response?.roles,
                      isSuperAdmin: response?.isSuperAdmin ? true : false,
                      userName: response?.userName,
                      interfaceLanguage: response?.interfaceLanguage,
                    },
                  }),
                );
                Cookies.set('interfaceLanguage', response?.interfaceLanguage?.toLowerCase());
              });
          };

          if (isCurrentUser && adminCheckHandler({ calendar, user })) {
            // Admin editing own profile: personal info + role/access via updateUserById
            updateUserById({
              id: userId,
              calendarId,
              body: {
                firstName: values?.firstName?.trim(),
                lastName: values?.lastName?.trim(),
                email: values?.email,
                interfaceLanguage: values?.languagePreference,
                ...imagePatch,
                modifyRole: {
                  userId: userId,
                  role: userType,
                  calendarId,
                  organizations,
                  people,
                  places,
                },
              },
            })
              .unwrap()
              .then(() => {
                refreshCurrentUserState(values);
                notification.success({
                  description: t('dashboard.userProfile.notification.profileUpdate'),
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}/${userId}`);
              })
              .catch((error) => {
                console.log(error);
                warningHandler(error);
              });
          } else if (isCurrentUser) {
            // Non-admin current user: personal info only via updateCurrentUser
            updateCurrentUser({
              calendarId,
              body: {
                firstName: values?.firstName?.trim(),
                lastName: values?.lastName?.trim(),
                email: values?.email,
                interfaceLanguage: values?.languagePreference,
                ...imagePatch,
              },
            })
              .unwrap()
              .then((response) => {
                if (response?.statusCode == 202) {
                  refreshCurrentUserState(values);
                  notification.success({
                    description: t('dashboard.userProfile.notification.profileUpdate'),
                    placement: 'top',
                    closeIcon: <></>,
                    maxCount: 1,
                    duration: 3,
                  });
                  navigate(
                    `${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}/${userId}`,
                  );
                }
              })
              .catch(warningHandler);
          } else if (user?.isSuperAdmin) {
            // Super admin editing another user: full update — personal info and role
            updateUserById({
              id: userId,
              calendarId,
              body: {
                firstName: values.firstName?.trim(),
                lastName: values.lastName?.trim(),
                email: values.email,
                interfaceLanguage: values?.languagePreference,
                ...imagePatch,
                modifyRole: {
                  userId: userId,
                  role: userType,
                  calendarId,
                  organizations,
                  people,
                  places,
                },
              },
            })
              .unwrap()
              .then((res) => {
                notification.success({
                  description: t(`dashboard.settings.addUser.notification.updateUser`),
                  key: res.message,
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}/${userId}`);
              })
              .catch((error) => {
                console.log(error);
                warningHandler(error);
              });
          } else if (adminCheckHandler({ calendar, user })) {
            // Regular admin editing another user: role/access only — personal info fields are disabled
            updateUserById({
              id: userId,
              calendarId,
              body: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                interfaceLanguage: userData.languagePreference,
                ...imagePatch,
                modifyRole: {
                  userId: userId,
                  role: userType,
                  calendarId,
                  organizations,
                  people,
                  places,
                },
              },
            })
              .unwrap()
              .then((res) => {
                notification.success({
                  description: t(`dashboard.settings.addUser.notification.updateUser`),
                  key: res.message,
                  placement: 'top',
                  closeIcon: <></>,
                  maxCount: 1,
                  duration: 3,
                });
                navigate(`${PathName.Dashboard}/${calendarId}${PathName.Settings}${PathName.UserManagement}/${userId}`);
              })
              .catch((error) => {
                console.log(error);
                warningHandler(error);
              });
          }
        })
        .catch((errors) => {
          console.error('Validation errors:', errors);
        });
    }
  };

  const setFormItemValues = ({ value, fieldType }) => {
    setUserData({ ...userData, [fieldType]: value });
  };

  const removeCalendarHandler = ({ item, index }) => {
    if (isCurrentUser) {
      Confirm({
        title: t('dashboard.settings.addUser.confirmLeave'),
        onAction: () => {
          isCurrentUser &&
            currentUserLeaveCalendar({ calendarId: item?.calendarId })
              .unwrap()
              .then(() => {
                if (selectedCalendars.length <= 1) {
                  dispatch(clearUser());
                  navigate(PathName.Login, { state: { previousPath: 'logout' } });
                }
                setSelectedCalendars((prevState) => {
                  const updatedArray = prevState.filter((_, i) => index !== i);
                  if (calendarId === item.calendarId) {
                    const newcalendar = userData.calendars.filter((i) => i.calendarId != item.calendarId);
                    navigate(`${PathName.Dashboard}/${newcalendar[0].calendarId}${PathName.Events}`);
                  }
                  return updatedArray;
                });
                dispatch(setReloadCalendar(true));
              });
        },
        content: t('dashboard.settings.addUser.leaveCalender'),
        okText: t('dashboard.settings.addUser.leave'),
        cancelText: t('dashboard.events.deleteEvent.cancel'),
      });
    } else if (userId) {
      Confirm({
        title: t('dashboard.settings.addUser.confirmLeave'),
        onAction: () => {
          currentUserLeaveCalendar({ calendarId });
          setSelectedCalendars((prevState) => {
            const updatedArray = prevState.filter((_, i) => index !== i);
            return updatedArray;
          });
        },
        content: t('dashboard.settings.addUser.leaveCalender'),
        okText: t('dashboard.settings.addUser.leave'),
        cancelText: t('dashboard.events.deleteEvent.cancel'),
      });
    }
  };

  const setRouteBlockingFlag = () => {
    if (!isFormDirty) setIsFormDirty(true);
  };

  return isSaving ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <LoadingIndicator />
    </div>
  ) : (
    <FeatureFlag isFeatureEnabled={featureFlags.settingsScreenUsers}>
      <RouteLeavingGuard isBlocking={isFormDirty} />
      <Form
        name="userAdd/Edit"
        initialValues={userData}
        form={formInstance}
        onValuesChange={setRouteBlockingFlag}
        onFinish={onSaveHandler}
        layout="vertical"
        fields={[
          {
            name: 'firstName',
            value: userData.firstName,
          },
          {
            name: ['lastName'],
            value: userData.lastName,
          },
          {
            name: ['email'],
            value: userData.email,
          },
          { name: ['languagePreference'], value: userData.languagePreference },
        ]}>
        {!(isUserFetching || isCurrentUserFetching) ? (
          <>
            <div className="sticky-header add-edit-wrapper add-user-wrapper">
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Row justify="space-between">
                    <Col className="breadcrumb">
                      <div className="button-container">
                        <Button
                          data-cy="button-user-back-to-previous"
                          type="link"
                          onClick={() => navigate(-2)}
                          icon={<LeftOutlined style={{ marginRight: '17px' }} />}>
                          {t('dashboard.organization.createNew.search.breadcrumb')}
                        </Button>
                      </div>
                    </Col>
                    <Col>
                      <div className="add-event-button-wrap">
                        <Form.Item>
                          <PrimaryButton
                            data-cy="button-user-save"
                            label={t('dashboard.events.addEditEvent.saveOptions.save')}
                            htmlType="submit"
                          />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col>
                  <div className="add-edit-event-heading">
                    <h4 data-cy="heading-user-profile-edit-add">
                      {isCurrentUser
                        ? t('dashboard.settings.addUser.userProfile')
                        : userId
                        ? t('dashboard.settings.addUser.editUser')
                        : t('dashboard.settings.addUser.newUser')}
                    </h4>
                  </div>
                </Col>
              </Row>
            </div>
            <Row gutter={[0, 32]} className="add-edit-wrapper add-user-wrapper">
              <Col flex={'780px'}>
                <Card style={{ border: 'none', width: '100%' }}>
                  <Row gutter={[0, 24]}>
                    <Col flex={'423px'}>
                      <div className="details-card-description" data-cy="div-user-profile-edit-add-page">
                        {isCurrentUser
                          ? t('dashboard.settings.addUser.detailsCardDescriptionCurrentUser')
                          : userId
                          ? t('dashboard.settings.addUser.detailsCardDescriptionEditPage')
                          : t('dashboard.settings.addUser.detailsCardDescriptionAddPage')}
                      </div>
                    </Col>
                    <Col span={24}>
                      <Row wrap={false} align="top" justify="space-between">
                        <Col flex={'423px'}>
                          <Form.Item
                            data-cy="form-item-user-email-title"
                            name="email"
                            required
                            label={t('dashboard.settings.addUser.email')}
                            rules={[
                              {
                                validator: (_, value) =>
                                  validateNotEmpty(_, value, t('dashboard.settings.addUser.validationTexts.email')),
                              },
                              {
                                type: 'email',
                                message: t('login.validations.invalidEmail'),
                              },
                            ]}>
                            <Row>
                              <Col flex={'423px'}>
                                <AuthenticationInput
                                  size="small"
                                  placeholder={t('dashboard.settings.addUser.placeHolder.email')}
                                  onChange={(e) => {
                                    setFormItemValues({ value: e.target.value, fieldType: 'email' });
                                    if (isExistingCmsUser) {
                                      setIsExistingCmsUser(false);
                                      setIsFirstNameDisabled(false);
                                      setIsLastNameDisabled(false);
                                      if (!userId) setProfileThumbnailUrl(null);
                                    }
                                  }}
                                  onBlur={onEmailBlur}
                                  value={userData.email}
                                  disabled={userId && !canEditPersonalInfo}
                                />
                              </Col>
                            </Row>
                          </Form.Item>

                          {userId && (
                            <Form.Item
                              data-cy="form-item-user-username-title"
                              required
                              label={t('dashboard.settings.addUser.userName')}>
                              <Row>
                                <Col flex={'423px'}>
                                  <AuthenticationInput size="small" disabled value={userData.userName} />
                                </Col>
                              </Row>
                            </Form.Item>
                          )}

                          <Form.Item
                            data-cy="form-item-user-first-name-title"
                            name="firstName"
                            required={!!userId}
                            label={t('dashboard.settings.addUser.firstName')}
                            rules={
                              userId
                                ? [
                                    {
                                      validator: (_, value) =>
                                        validateNotEmpty(
                                          _,
                                          value,
                                          t('dashboard.settings.addUser.validationTexts.firstName'),
                                        ),
                                    },
                                  ]
                                : []
                            }>
                            <Row>
                              <Col flex={'423px'}>
                                {userId ? (
                                  <AuthenticationInput
                                    size="small"
                                    placeholder={t('dashboard.settings.addUser.placeHolder.firstName')}
                                    onChange={(e) =>
                                      setFormItemValues({ value: e.target.value, fieldType: 'firstName' })
                                    }
                                    value={userData.firstName}
                                    disabled={!canEditPersonalInfo}
                                  />
                                ) : (
                                  <AuthenticationInput
                                    size="small"
                                    placeholder={t('dashboard.settings.addUser.placeHolder.firstName')}
                                    onChange={(e) =>
                                      setFormItemValues({ value: e.target.value, fieldType: 'firstName' })
                                    }
                                    value={userData.firstName}
                                    disabled={isFirstNameDisabled}
                                  />
                                )}
                              </Col>
                            </Row>
                          </Form.Item>

                          <Form.Item
                            data-cy="form-item-user-last-name-title"
                            name="lastName"
                            required={!!userId}
                            label={t('dashboard.settings.addUser.lastName')}
                            rules={
                              userId
                                ? [
                                    {
                                      validator: (_, value) =>
                                        validateNotEmpty(
                                          _,
                                          value,
                                          t('dashboard.settings.addUser.validationTexts.lastName'),
                                        ),
                                    },
                                  ]
                                : []
                            }>
                            <Row>
                              <Col flex={'423px'}>
                                <AuthenticationInput
                                  size="small"
                                  placeholder={t('dashboard.settings.addUser.placeHolder.lastName')}
                                  onChange={(e) => setFormItemValues({ value: e.target.value, fieldType: 'lastName' })}
                                  value={userData.lastName}
                                  disabled={(userId && !canEditPersonalInfo) || isLastNameDisabled}
                                />
                              </Col>
                            </Row>
                          </Form.Item>

                          {(userId || (isExistingCmsUser && newUserFoundImageData)) && (
                            <Form.Item
                              data-cy="form-item-user-profile-picture-title"
                              label={t('dashboard.settings.addUser.profilePicture')}>
                              <Row>
                                <Col flex={'423px'}>
                                  <ImageUpload
                                    key={profileImageKey}
                                    form={formInstance}
                                    formName="profilePicture"
                                    isCrop={userId ? canEditPersonalInfo : false}
                                    imageCropOpen={imageCropOpen}
                                    setImageCropOpen={setImageCropOpen}
                                    largeAspectRatio="1:1"
                                    thumbnailAspectRatio="1:1"
                                    imageUrl={
                                      userId
                                        ? !profileImageDeleted
                                          ? mainImageData?.large?.uri
                                          : undefined
                                        : newUserFoundImageData?.large?.uri
                                    }
                                    originalImageUrl={
                                      userId
                                        ? !profileImageDeleted
                                          ? mainImageData?.original?.uri
                                          : undefined
                                        : newUserFoundImageData?.original?.uri
                                    }
                                    thumbnailImage={
                                      userId
                                        ? !profileImageDeleted
                                          ? mainImageData?.thumbnail?.uri
                                          : undefined
                                        : newUserFoundImageData?.thumbnail?.uri
                                    }
                                    eventImageData={
                                      userId
                                        ? !profileImageDeleted
                                          ? mainImageData
                                          : undefined
                                        : newUserFoundImageData
                                    }
                                    preview={true}
                                    imageReadOnly={userId ? !canEditPersonalInfo : true}
                                    hideMetadataOptions={true}
                                    onImageChange={userId ? setProfileThumbnailUrl : undefined}
                                    setShowDialog={setRouteBlockingFlag}
                                  />
                                </Col>
                              </Row>
                            </Form.Item>
                          )}

                          {userId && !isExistingCmsUser && (
                            <Form.Item
                              data-cy="form-item-user-language-title"
                              name="languagePreference"
                              required
                              label={t('dashboard.settings.addUser.languagePreference')}
                              rules={[
                                {
                                  validator: (_, value) =>
                                    validateNotEmpty(
                                      _,
                                      value,
                                      t('dashboard.settings.addUser.validationTexts.language'),
                                    ),
                                },
                              ]}>
                              <Select
                                options={userLanguages.filter(({ value }) => ['EN', 'FR'].includes(value))}
                                onChange={(value) => setFormItemValues({ value, fieldType: 'languagePreference' })}
                                data-cy="select-user-language"
                                disabled={userId && !canEditPersonalInfo}
                              />
                            </Form.Item>
                          )}

                          {isCurrentUser && (
                            <div className="password-modal">
                              <div className="button-container">
                                <OutlinedButton
                                  data-cy="button-changepassword"
                                  label={t('dashboard.settings.addUser.passwordModal.btnText')}
                                  size="large"
                                  style={{ height: '40px' }}
                                  onClick={() => setIsPopoverOpen({ ...isPopoverOpen, password: true })}
                                />
                              </div>
                              <ChangePassword isPopoverOpen={isPopoverOpen} setIsPopoverOpen={setIsPopoverOpen} />
                            </div>
                          )}
                        </Col>

                        {profileThumbnailUrl && (userId || isExistingCmsUser) && (
                          <Col style={{ paddingLeft: '24px' }}>
                            <div className="profile-thumbnail-wrapper">
                              <img
                                src={profileThumbnailUrl}
                                alt="profile"
                                style={{ width: '151px', height: '151px', objectFit: 'cover', borderRadius: '4px' }}
                                data-cy="image-user-profile-thumbnail-edit"
                              />
                              {userId && canEditPersonalInfo && (
                                <div className="profile-thumbnail-overlay">
                                  <EditOutlined
                                    className="profile-thumbnail-action-icon"
                                    data-cy="icon-edit-profile-picture"
                                    onClick={() => setImageCropOpen(true)}
                                  />
                                  <DeleteOutlined
                                    className="profile-thumbnail-action-icon"
                                    data-cy="icon-delete-profile-picture"
                                    onClick={() => {
                                      setProfileThumbnailUrl(null);
                                      setProfileImageDeleted(true);
                                      setProfileImageKey((k) => k + 1);
                                      formInstance.setFieldsValue({ profilePicture: [], imageCrop: null });
                                      setRouteBlockingFlag();
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </Col>
              {selectedCalendars?.length > 0 && (
                <Col span={24}>
                  <Row>
                    <Col flex={'780px'}>
                      <Card style={{ border: 'none' }}>
                        <Row>
                          <Col span={24} className="card-heading-container">
                            <h5 data-cy="heading-user-calendars">{t(`dashboard.settings.addUser.calendars`)}</h5>
                          </Col>
                        </Row>
                        <Row>
                          <Col flex={'423px'} className="calendar-search">
                            <Row gutter={[0, 4]}>
                              <Col flex={'423px'}>
                                <Col>
                                  <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                                    {selectedCalendars?.map((selectedCalendar, index) => (
                                      <CalendarAccordion
                                        form={formInstance}
                                        data-cy="accordion-selected-calendars"
                                        key={selectedCalendar?.calendarId}
                                        setRouteBlockingFlag={setRouteBlockingFlag}
                                        required={selectedCalendar?.calendarId === calendarId}
                                        selectedCalendarId={selectedCalendar?.calendarId}
                                        name={contentLanguageBilingual({
                                          data: selectedCalendar?.name,
                                          interfaceLanguage: user?.interfaceLanguage?.toLowerCase(),
                                          calendarContentLanguage:
                                            allCalendarsData?.find((cal) => cal.id === selectedCalendar?.calendarId)
                                              ?.contentLanguage ?? calendarContentLanguage,
                                        })}
                                        role={selectedCalendar?.role}
                                        readOnly={!canEditCalendarInfo}
                                        disabled={selectedCalendar?.disabled}
                                        organizationIds={selectedCalendar?.organizations}
                                        peopleIds={selectedCalendar?.people}
                                        placeIds={selectedCalendar?.places}
                                        isCurrentUser={isCurrentUser}
                                        removeCalendarHandler={() => {
                                          removeCalendarHandler({ item: selectedCalendar, index });
                                        }}
                                      />
                                    ))}
                                  </div>
                                </Col>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              )}
            </Row>
          </>
        ) : (
          <div style={{ height: 400, width: '100%', display: 'grid', placeContent: 'center' }}>
            <LoadingIndicator data-cy="loading-indicator-user" />
          </div>
        )}
      </Form>
    </FeatureFlag>
  );
};

export default AddUser;
