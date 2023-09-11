function checkFeatureFlag(flag) {
  if (flag === 'true') return true;
  else return false;
}

export const featureFlags = {
  quickCreateOrganization: process.env.REACT_APP_FEATURE_FLAG_QUICK_CREATE_ORGANIZATION,
  orgPersonPlacesView: process.env.REACT_APP_FEATURE_FLAG_ORG_PERSON_PLACE_VIEW,
  quickCreatePersonPlace: process.env.REACT_APP_FEATURE_FLAG_QUICK_CREATE_PEOPLE_PLACE,
  editScreenPeoplePlaceOrganization: process.env.REACT_APP_FEATURE_FLAG_EDIT_SCREEN_PEOPLE_PLACE_ORGANIZATION,
  imageCropFeature: checkFeatureFlag(process.env.REACT_APP_FEATURE_FLAG_IMAGE_CROP),
};
