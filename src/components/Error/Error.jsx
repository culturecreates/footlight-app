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

function ErrorAlert(props) {
  const { errorType = 'general' } = props;

  const errorDetails = useSelector(getErrorDetails);
  const error = useRouteError();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  let image, message, heading;

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

  heading = t('errorPage.heading');
  image = <GeneralErrors />;

  if (errorType === 'serverDown') {
    heading = t('errorPage.serverDown');
  } else if (errorType === 'failedAPI' && errorDetails?.isError) {
    message = errorDetails?.message;
  }
  if (errorType === 'general' && !errorDetails.isError) {
    message = error?.message;
  } else if (errorType === 'pageNotFound') {
    image = <Error404 />;
    message = t('errorPage.notFoundMessage');
  }

  return (
    <div className="error-page">
      <div className="content">
        <div className="image-container">{image}</div>
        <section>
          <h1>{heading}</h1>
          <>
            <p className="error-message">{message}</p>
            <p className="error-time">{new Date().toISOString()}</p>
            <div className="btn-container">
              <Button
                onClick={() => {
                  navigate('/');
                  infiniteLoopHandler(() => {
                    dispatch(clearUser());
                  });
                  dispatch(clearErrors());
                }}>
                {t('errorPage.buttonText')}
              </Button>
            </div>
            <div className="escape-guide-container">
              <span className="error-message">{t('errorPage.backTologin')}</span>
              <span
                className="exit-button"
                onClick={() => {
                  removeCachedData();
                  dispatch(clearErrors());
                  navigate('/');
                }}>
                {t('errorPage.exit')}
              </span>
            </div>
          </>
        </section>
      </div>
    </div>
  );
}

export default ErrorAlert;
