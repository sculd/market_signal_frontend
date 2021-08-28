/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useAuth0 } from "@auth0/auth0-react";
import { alertApiBaseUrl } from "../utils/apiUrls";

const AlertDelete = (props) => {
  const {
    list_index,
    alert,
    after_ok
  } = props;
  const [apiState, setApiState] = useState({
    showResult: false,
    apiMessage: "",
    error: null,
  });

  const [modal, setModal] = useState(false);
  const {
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${alertApiBaseUrl}/users/${user.sub.split("auth0|").pop()}/alerts/${alert.alert_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'DELETE',
      });

      const responseData = await response.json();

      setApiState({
        ...apiState,
        showResult: true,
        apiMessage: responseData,
      });
    } catch (error) {
      setApiState({
        ...apiState,
        error: error.error,
      });
    }
    if (!apiState.error) {
        setModal(!modal);
    }
    if (after_ok) {
      after_ok();
    }
  };

  const showModal = () => {
    setModal(true);
    setApiState(
      {
        showResult: false,
        apiMessage: "",
        error: null,
      });
  }

  const toggle = () => {
      if (!modal) {
          return;
      }
      setModal(!modal);
  }

  const handleOk = () => {
    callApi()
  };

  const handleConsent = async () => {
    try {
      await getAccessTokenWithPopup();
      setApiState({
        ...apiState,
        error: null,
      });
    } catch (error) {
      setApiState({
        ...apiState,
        error: error.error,
      });
    }

    await callApi();
  };

  const handleLoginAgain = async () => {
    try {
      await loginWithPopup();
      setApiState({
        ...apiState,
        error: null,
      });
    } catch (error) {
      setApiState({
        ...apiState,
        error: error.error,
      });
    }

    await callApi();
  };

  const handle = (e, fn) => {
    e.preventDefault();
    fn();
  };

  return (
    <div>
      <Button outline color="danger" onClick={showModal}>{props.children}</Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Delete an alert.
        </ModalHeader>
        <ModalBody>
            {apiState.error === "consent_required" && (
              <Alert color="warning">
                You need to{" "}
                <a
                  href="#/"
                  class="alert-link"
                  onClick={(e) => handle(e, handleConsent)}
                >
                  consent to get access to users api
                </a>
              </Alert>
            )}

            {apiState.error === "login_required" && (
              <Alert color="warning">
                You need to{" "}
                <a
                  href="#/"
                  class="alert-link"
                  onClick={(e) => handle(e, handleLoginAgain)}
                >
                  log in again
                </a>
              </Alert>
            )}

            Are you sure to delete alert #{list_index} "{alert?.alert_name}"?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleOk}>Ok</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default AlertDelete;
