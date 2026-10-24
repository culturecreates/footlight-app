import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, message } from 'antd';
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { scrollToFirstError } from '../utils/scrollToFirstError';

export const useHandleValidationError = ({ form, warningKey, errorMessageKey }) => {
  const { t } = useTranslation();

  return useCallback(
    (error, options = {}) => {
      const { scrollBlock = 'center' } = options;
      scrollToFirstError(error, form, {
        scrollBlock,
        getElement: (fieldNamePath, fieldName) => {
          const isDynamic = Array.isArray(fieldNamePath) && fieldNamePath[0] === 'dynamicFields';
          const className = isDynamic ? String(fieldNamePath[1]) : fieldName;
          return document.getElementsByClassName(className)?.[0];
        },
      });
      message.warning({
        duration: 10,
        maxCount: 1,
        key: warningKey,
        content: (
          <>
            {t(errorMessageKey)} &nbsp;
            <Button
              type="text"
              icon={<CloseCircleOutlined style={{ color: '#222732' }} />}
              onClick={() => message.destroy(warningKey)}
            />
          </>
        ),
        icon: <ExclamationCircleOutlined />,
      });
    },
    [form, t],
  );
};
