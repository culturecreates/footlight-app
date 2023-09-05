import { useNavigate, useRouteError } from 'react-router-dom';
import { ReactComponent as GeneralErrors } from '../../assets/images/general-error.svg';
import { ReactComponent as Error404 } from '../../assets/images/404-error.svg';
import './error.css';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';

function ErrorAlert(props) {
  const { errorType = 'general' } = props;

  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isServerDown = errorType === 'serverDown';

  const image = errorType === 'general' || isServerDown ? <GeneralErrors /> : <Error404 />;
  const message = errorType === 'general' ? error.message : t('errorPage.notFoundMessage');
  const heading = isServerDown ? t('errorPage.serverDown') : t('errorPage.heading');

  console.error(message, new Date().toISOString());

  return (
    <div className="error-page">
      <div className="content">
        <div className="image-container">{image}</div>
        <section>
          <h1>{heading}</h1>
          {!isServerDown && (
            <>
              <p className="error-message">{message}</p>
              <p className="error-time">{new Date().toISOString()}</p>
              <div className="btn-container">
                <Button
                  onClick={() => {
                    navigate(-2);
                  }}>
                  {t('errorPage.buttonText')}
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default ErrorAlert;
