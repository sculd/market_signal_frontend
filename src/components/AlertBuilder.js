/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Alert, Button, FormGroup, Spinner, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Container, Row, Col } from 'reactstrap';
import Select from 'react-select'
import { useAuth0 } from "@auth0/auth0-react";


const options_window = [
    { value: '20', label: '20 Minutes' },
    { value: '360', label: '1 Hour' },
    { value: '1080', label: '3 Hours' }
];

const options_threshold = [
    { value: '5', label: '5%' },
    { value: '10', label: '10%' },
    { value: '20', label: '20%' }
];

const options_move_direction = [
    { value: 'jump', label: 'Jump' },
    { value: 'drop', label: 'Drop' }
];

const options_destinatino_type = [
    { value: 'email', label: 'E-Mail' },
    { value: 'sms', label: 'SMS' }
];

const valueToOption = (value, options) => {
    if (value === undefined) {
        return options[0]
    }
    const matches = options.filter((o) => o.value === value);
    if (!matches) {
        return options[0]
    }
    return matches.slice(-1)[0]
};

const AlertBuilder = (props) => {
  const {
    alert,
    after_ok
  } = props;

  const [modal, setModal] = useState(false);
  const [alertName, setAlertName] = React.useState(alert?.alert_name || '');
  const [description, setDescription] = React.useState(alert?.description || '');
  const [symbol, setSymbol] = React.useState(alert?.symbol || '');
  const [window, setwindow] = React.useState(valueToOption(alert?.window_size_minutes, options_window));
  const [threshold, setThreshold] = React.useState(valueToOption(alert?.threshold_percent, options_threshold));
  const [moveDirection, setMoveDirection] = React.useState(valueToOption(alert?.move_type, options_move_direction));
  const [destinationType, setDestinationType] = React.useState(valueToOption(alert?.notification_destination_type, options_destinatino_type));
  const [destination, setDestination] = React.useState(alert?.notification_destination || '');

  function resetStates() {
    setAlertName(alert?.alert_name || '');
    setDescription(alert?.description || '');
    setSymbol(alert?.symbol || '');
    setwindow(valueToOption(alert?.window_size_minutes, options_window));
    setThreshold(valueToOption(alert?.threshold_percent, options_threshold));
    setMoveDirection(valueToOption(alert?.move_type, options_move_direction));
    setDestinationType(valueToOption(alert?.notification_destination_type, options_destinatino_type));
    setDestination(alert?.notification_destination || '');
    }

  // Form change handler
  const handleAlertNameChange = (event) => {
    setAlertName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSymbolChange = (event) => {
        setSymbol(event.target.value);
  };

  const handleDestinationChange = (event) => {
    setDestination(event.target.value);
};

  // Select form change handler
  const handleWindowChange = (event) => {
        setwindow(event.value);
  };

  const handleThresholdChange = (event) => {
        setThreshold(event.value);
  };

  const handleMoveDirectionChange = (event) => {
        setMoveDirection(event.value);
  };

  const handleDestinationTypeChange = (event) => {
        setDestinationType(event.value);
  };

  // API
  const [apiState, setApiState] = useState({
    isLoading: false,
    showResult: false,
    apiMessage: "",
    error: "",
  });

  function resetApiState() {
    setApiState({
      ...apiState,
      isLoading: false,
      showResult: false,
      apiMessage: "",
      error: "",
    });
  }

  const alertApiOrigin = "https://ynpz1kpon8.execute-api.us-east-2.amazonaws.com/test";
  const {
    isAuthenticated,
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const body = {
        alert_name: alertName,
        symbols: symbol,
        description: description,
        time_window_minutes: window.value,
        threshold_percent: threshold.value,
        move_type: moveDirection.value,
        notification_destination_type: destinationType.value,
        notification_destination: destination
      }
      const response = await fetch(`${alertApiOrigin}/users/${user.sub.split("auth0|").pop()}/alerts/${alert?.alert_id || ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: JSON.stringify(body)
      });

      const responseData = await response.json();
      var apiError = "";
      const isApiError = response.status >= 400;
      if (isApiError) {
        apiError = responseData;
      }

      setApiState({
        ...apiState,
        showResult: true,
        apiMessage: responseData,
        error: apiError,
        isLoading: false,
      });

      if (!isApiError) {
        setModal(false);
        if (after_ok) {
          after_ok();
        }
      }
    } catch (error) {
      setApiState({
        ...apiState,
        error: error.error,
      });
    }
  };

  const openModal = () => {
      resetStates()
      console.log('alert:', alert)
      resetApiState();
      setModal(true);
  }

  const toggle = () => setModal(!modal);

  const handleOk = () => {
    setApiState({
      ...apiState,
      isLoading: true,
    });
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
      <Button outline color="primary" onClick={openModal}>{props.children}</Button>
      <Modal isOpen={modal} toggle={toggle} backdrop={true}>
        <ModalHeader toggle={toggle}>
            <Input type="text" placeholder="Alert name." defaultValue={alertName} onChange={handleAlertNameChange} />
            {apiState.isLoading && (
                <Spinner size="sm" color="primary" />
            )}
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

        {apiState.error && (
            <Alert color="warning">
            {apiState.error}
            </Alert>
        )}

        <Container>
            <FormGroup row>
                <Col>Description:</Col>
            </FormGroup>
            <FormGroup row>
                <Col>
                    <Input type="textarea" placeholder="(Description of the alert)." defaultValue={description} onChange={handleDescriptionChange} />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Label sm="2">Symbol:</Label>
                <Col sm="10">
                    <Input type="text" defaultValue={symbol} onChange={handleSymbolChange} />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Col sm="2">Window:</Col>
                <Col sm="5"></Col>
                <Col sm="5">
                    <Select
                        defaultValue={window}
                        onChange={handleWindowChange}
                        options={options_window}
                    />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Col sm="2">Threshold:</Col>
                <Col sm="3"></Col>
                <Col sm="3">
                    <Select
                        defaultValue={threshold}
                        onChange={handleThresholdChange}
                        options={options_threshold}
                    />
                </Col>
                <Col sm="4">
                    <Select
                        defaultValue={moveDirection}
                        onChange={handleMoveDirectionChange}
                        options={options_move_direction}
                    />
                </Col>
            </FormGroup>
            <FormGroup row>
                <Col sm="2">Desination:</Col>
                <Col sm="5"></Col>
                <Col sm="5">
                    <Select
                        defaultValue={destinationType}
                        onChange={handleDestinationTypeChange}
                        options={options_destinatino_type}
                    />
                </Col>
            </FormGroup>
            <Row>
                <Col>
                    <Input type="text" placeholder="Alert destination." defaultValue={destination} onChange={handleDestinationChange} />
                </Col>
            </Row>
        </Container>
        
        </ModalBody>
        <ModalFooter>
          {isAuthenticated && (
          <Button color="primary" onClick={handleOk}>Ok</Button>
          )}
          {!isAuthenticated && (
          <Button color="primary" disabled>Ok</Button>
          )}
          {' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default AlertBuilder;
