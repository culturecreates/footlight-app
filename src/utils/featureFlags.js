function checkFeatureFlag(flag) {
  if (flag === 'true') return true;
  else return false;
}

export const featureFlags = {
  quickCreateOrganization: import.meta.env.VITE_APP_FEATURE_FLAG_QUICK_CREATE_ORGANIZATION,
  orgPersonPlacesView: import.meta.env.VITE_APP_FEATURE_FLAG_ORG_PERSON_PLACE_VIEW,
  quickCreatePersonPlace: import.meta.env.VITE_APP_FEATURE_FLAG_QUICK_CREATE_PEOPLE_PLACE,
  editScreenPeoplePlaceOrganization: import.meta.env.VITE_APP_FEATURE_FLAG_EDIT_SCREEN_PEOPLE_PLACE_ORGANIZATION,
  settingsScreenUsers: import.meta.env.VITE_APP_FEATURE_FLAG_USERS,
  taxonomy: import.meta.env.VITE_APP_FEATURE_FLAG_TAXONOMY,
  imageCropFeature: checkFeatureFlag(import.meta.env.VITE_APP_FEATURE_FLAG_IMAGE_CROP),
};
