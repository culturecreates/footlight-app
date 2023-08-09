import { useRouteError } from 'react-router-dom';
import { ReactComponent as NotFound } from '../../assets/images/illustatus.svg';
import Alert from '../Alert/Alert';
import { InfoCircleOutlined } from '@ant-design/icons';
import './error.css';

function ErrorAlert() {
  const error = useRouteError();
  console.log(error);
  return (
    <div className="error-page">
      <NotFound />
      <div className="floating-alert">
        <Alert message={error.message} type="error" showIcon icon={<InfoCircleOutlined />} />
      </div>
    </div>
  );
}

export default ErrorAlert;
