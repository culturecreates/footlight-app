import { useNavigate, useRouteError } from 'react-router-dom';
import { ReactComponent as GeneralErrors } from '../../assets/images/general-error.svg';
import { ReactComponent as Error404 } from '../../assets/images/404-error.svg';
import './error.css';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getErrorDetails } from '../../redux/reducer/ErrorSlice';
import { useEffect } from 'react';

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
      dispatch(clearErrors());
    };
    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [dispatch]);

  if (errorType === 'serverDown') {
    image = <GeneralErrors />;
    heading = t('errorPage.serverDown');
  } else if (errorType === 'failedAPI' && errorDetails?.isError) {
    image = <GeneralErrors />;
    heading = t('errorPage.heading');
    message = errorDetails?.message;
  }
  if (errorType === 'general' && !errorDetails.isError) {
    image = <GeneralErrors />;
    heading = t('errorPage.heading');
    message = error?.message;
  } else if (errorType === 'pageNotFound') {
    image = <Error404 />;
    message = t('errorPage.notFoundMessage');
    heading = t('errorPage.heading');
  }

  return (
    <div className="error-page">
      <div className="content">
        <div className="image-container">{image}</div>
        <section>
          <h1>{heading}</h1>
          {/* {errorType !== 'serverDown' && ( */}
          <>
            <p className="error-message">{message}</p>
            <p className="error-time">{new Date().toISOString()}</p>
            <div className="btn-container">
              <Button
                onClick={() => {
                  navigate(-2);
                  dispatch(clearErrors());
                }}>
                {t('errorPage.buttonText')}
              </Button>
            </div>
          </>
          {/* )} */}
        </section>
      </div>
    </div>
  );
}

export default ErrorAlert;
