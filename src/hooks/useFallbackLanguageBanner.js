import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearActiveFallbackFieldsInfo,
  getActiveFallbackFieldsInfo,
  getIsBannerDismissed,
  getLanguageLiteralBannerDisplayStatus,
  setBannerDismissed,
  setLanguageLiteralBannerDisplayStatus,
} from '../redux/reducer/languageLiteralSlice';

export const useFallbackLanguageBanner = () => {
  const dispatch = useDispatch();
  const languageLiteralBannerDisplayStatus = useSelector(getLanguageLiteralBannerDisplayStatus);
  const isBannerDismissed = useSelector(getIsBannerDismissed);
  const activeFallbackFieldsInfo = useSelector(getActiveFallbackFieldsInfo);

  useEffect(() => {
    dispatch(clearActiveFallbackFieldsInfo());
    dispatch(setBannerDismissed(false));
  }, []);

  useEffect(() => {
    let shouldDisplay = true;

    const fallbackFieldNames = Object.keys(activeFallbackFieldsInfo) || [];
    let individualFallbackFieldsCollection = [];
    fallbackFieldNames.forEach((name) => {
      individualFallbackFieldsCollection.push(...Object.values(activeFallbackFieldsInfo[name] || []));
    });

    individualFallbackFieldsCollection.forEach((element) => {
      if (element?.tagDisplayStatus) {
        shouldDisplay = false;
      }
    });

    if (!shouldDisplay && !isBannerDismissed) {
      dispatch(setLanguageLiteralBannerDisplayStatus(true));
    } else {
      dispatch(setLanguageLiteralBannerDisplayStatus(false));
    }
  }, [activeFallbackFieldsInfo]);

  return { languageLiteralBannerDisplayStatus, isBannerDismissed, activeFallbackFieldsInfo };
};
