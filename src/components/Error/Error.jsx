import { useNavigate, useRouteError } from 'react-router-dom';
import { ReactComponent as GeneralErrors } from '../../assets/images/general-error.svg';
import { ReactComponent as Error404 } from '../../assets/images/404-error.svg';
import './error.css';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getErrorDetails } from '../../redux/reducer/ErrorSlice';
import { useEffect } from 'react';
import { clearUser } from '../../redux/reducer/userSlice';
import { infiniteLoopHandler } from '../../utils/infiniteLoopHandler';
import { removeCachedData } from '../../utils/removeCachedData';
import { errorTypes } from '../../constants/errors';

function ErrorAlert(props) {
  const { errorType = errorTypes.GENERAL } = props;

  const errorDetails = useSelector(getErrorDetails);
  const error = useRouteError();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    // effect to trigger api reload when browser back button is pressed
    const handlePopstate = () => {
      infiniteLoopHandler(() => {
        dispatch(clearUser());
      });
      dispatch(clearErrors());
    };
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [dispatch]);

  // Get error display configuration
  const getErrorConfig = () => {
    const config = {
      image: <GeneralErrors />,
      heading: t('errorPage.heading'),
      message: error?.message,
    };

    switch (errorType) {
      case errorTypes.SERVER_DOWN:
        config.heading = t('errorPage.serverDown');
        break;
      case errorTypes.FAILED_API:
        if (errorDetails?.isError) {
          config.message = errorDetails?.message;
        }
        break;
      case errorTypes.PAGE_NOT_FOUND:
        config.image = <Error404 />;
        config.message = t('errorPage.notFoundMessage');
        break;
      case errorTypes.GENERAL:
        if (!errorDetails?.isError) {
          config.message = error?.message;
        }
        break;
      default:
        break;
    }

    return config;
  };

  const { image, heading, message } = getErrorConfig();

  const handleNavigation = () => {
    navigate('/');
    infiniteLoopHandler(() => dispatch(clearUser()));
    dispatch(clearErrors());
  };

  const handleExit = () => {
    removeCachedData();
    dispatch(clearErrors());
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="content">
        <div className="image-container">{image}</div>
        <section>
          <h1>{heading}</h1>
          <p className="error-message">{message}</p>
          <p className="error-time">{new Date().toISOString()}</p>

          <div className="btn-container">
            <Button onClick={handleNavigation}>{t('errorPage.buttonText')}</Button>
          </div>

          <div className="escape-guide-container">
            <span className="error-message">{t('errorPage.backTologin')}</span>
            <span className="exit-button" onClick={handleExit}>
              {t('errorPage.exit')}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ErrorAlert;
