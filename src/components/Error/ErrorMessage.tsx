import React from "react";
import styles from "./errorMessage.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceMeh } from "@fortawesome/pro-light-svg-icons";
import { Trans } from "react-i18next";

interface ErrorMessageProps {
  errorMessage?: {
    message: string;
  };
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ errorMessage }) => {
  return (
    <div className={styles.error}>
      <FontAwesomeIcon icon={faFaceMeh} className={styles.icon} />
      <p>
        <Trans>{errorMessage?.message}</Trans>
      </p>
    </div>
  );
};

export default ErrorMessage;
