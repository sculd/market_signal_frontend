/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Alert, Button, FormGroup, Spinner, CustomInput, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter, Popover, PopoverBody } from 'reactstrap';
import { Container, Col } from 'reactstrap';
import { Link } from "react-router-dom";
import Select from 'react-select'
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { alertApiBaseUrl } from "../utils/apiUrls";


const emailRegExp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const phoneNumberRegExp = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

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
    after_ok,
    allowSMSAlert,
    allowWildcardSymbol
  } = props;

  const [modal, setModal] = useState(false);
  const [alertName, setAlertName] = React.useState(alert?.alert_name || '');
  const [description, setDescription] = React.useState(alert?.description || '');
  const [symbol, setSymbol] = React.useState(alert?.symbol || '');
  const [allSymbolChecked, setAllSymbolChecked] = React.useState(alert?.is_all_symbols || false);
  const [allSymbolHelpPopoverOpen, setAllSymbolHelpPopoverOpen] = useState(false);
  const [window, setwindow] = React.useState(valueToOption(alert?.window_size_minutes, options_window));
  const [threshold, setThreshold] = React.useState(valueToOption(alert?.threshold_percent, options_threshold));
  const [moveDirection, setMoveDirection] = React.useState(valueToOption(alert?.move_type, options_move_direction));
  const [destinatinoTypeEmailChecked, setDestinatinoTypeEmailChecked] = React.useState(true);
  const [destinatinoTypeSMSChecked, setDestinatinoTypeSMSChecked] = React.useState(false);
  const [destinatinoTypeSMSHelpPopoverOpen, setDestinatinoTypeSMSHelpPopoverOpen] = useState(false);
  const [emailDestination, setEmailDestination] = React.useState(alert?.notification_destination || '');
  const [smsDestination, setSmsDestination] = React.useState(alert?.notification_destination || '');

  function resetStates() {
    setAlertName(alert?.alert_name || '');
    setDescription(alert?.description || '');
    setSymbol(alert?.symbol || '');
    setAllSymbolChecked(alert?.is_all_symbols || false);
    setwindow(valueToOption(alert?.window_size_minutes, options_window));
    setThreshold(valueToOption(alert?.threshold_percent, options_threshold));
    setMoveDirection(valueToOption(alert?.move_type, options_move_direction));
    setDestinatinoTypeEmailChecked(alert?.notification_to_email === undefined || alert?.notification_to_email)
    setDestinatinoTypeSMSChecked(alert?.notification_to_sms || false)
    setEmailDestination(alert?.notification_email || '');
    setSmsDestination(alert?.notification_sms || '');
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

  const handleAllSymbolToggle = (event) => {
    setAllSymbolChecked(event.target.checked);
  }

  const handleAllSymbolHelpPopoverToggle = () => setAllSymbolHelpPopoverOpen(!allSymbolHelpPopoverOpen);

  const handleDestinationTypeEmailToggle = (event) => {
    setDestinatinoTypeEmailChecked(event.target.checked);
  }

  const handleDestinationTypeSMSToggle = (event) => {
    setDestinatinoTypeSMSChecked(event.target.checked);
  }

  const handleDestinationTypeSMSHelpPopoverToggle = () => setDestinatinoTypeSMSHelpPopoverOpen(!destinatinoTypeSMSHelpPopoverOpen);

  const getValidEmail = () => {
    return emailDestination !== '' && emailRegExp.exec(emailDestination) !== null
  }

  const getInValidEmail = () => {
    return emailDestination !== '' && destinatinoTypeEmailChecked && emailRegExp.exec(emailDestination) === null
  }

  const normalizePhoneNumber = (value) => {
    if (!value) return value;
    const currentValue = value.replace(/[^\d]/g, '');
    const cvLength = currentValue.length;
    
    if (cvLength < 4) return currentValue;
    if (cvLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
    return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
  };
  
  const getValidSMS = () => {
    return smsDestination !== '' && phoneNumberRegExp.exec(smsDestination) !== null
  }

  const getInValidSMS = () => {
    return smsDestination !== '' && destinatinoTypeSMSChecked && phoneNumberRegExp.exec(smsDestination) === null
  }

  const getValidInputs = () => {
    const email = !destinatinoTypeEmailChecked || getValidEmail()
    const sms = !destinatinoTypeSMSChecked || getValidSMS()
    return email && sms
  }

  const handleEmailDestinationChange = (event) => {    
    setEmailDestination(event.target.value);
  };

  const handleSMSDestinationChange = (event) => {
    setSmsDestination(normalizePhoneNumber(event.target.value));
  };

  // Select form change handler
  const handleWindowChange = (event) => {
      setwindow(event);
  };

  const handleThresholdChange = (event) => {
      setThreshold(event);
  };

  const handleMoveDirectionChange = (event) => {
      setMoveDirection(event);
  };

  // API
  const {
    isAuthenticated,
    getAccessTokenSilently,
    loginWithPopup,
    getAccessTokenWithPopup,
    user,
  } = useAuth0();

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

  const callApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      const body = {
        alert_name: alertName,
        symbols: symbol,
        is_all_symbols: allSymbolChecked,
        description: description,
        time_window_minutes: window.value,
        threshold_percent: threshold.value,
        move_type: moveDirection.value,
        notification_to_email: destinatinoTypeEmailChecked,
        notification_email: emailDestination,
        notification_to_sms: destinatinoTypeSMSChecked,
        notification_sms: smsDestination,
      }
      const response = await fetch(`${alertApiBaseUrl}/users/${user.sub.split("auth0|").pop()}/alerts/${alert?.alert_id || ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'POST',
        body: JSON.stringify(body)
      });

      var apiError = "";
      const isApiError = response.status >= 400;
      const responseData = await response.json();
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
          <Label>Alert Name:</Label>
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
                <Col sm="6">
                    <Input type="text" defaultValue={symbol} onChange={handleSymbolChange} disabled={allSymbolChecked} />
                </Col>
                <Label check sm="2">
                  <Input type="checkbox" onChange={handleAllSymbolToggle} checked={allSymbolChecked} disabled={!allowWildcardSymbol} />
                  Any
                </Label>
                <Label help sm="2">
                <a type="button" class="btn-tw"><FontAwesomeIcon id="allSymbolsHelpPopover" icon="question-circle" /></a>
                <Popover placement="bottom" isOpen={allSymbolHelpPopoverOpen} target="allSymbolsHelpPopover" toggle={handleAllSymbolHelpPopoverToggle}>
                  <PopoverBody>Alert when ANY symbol matches the condition. Only for paid users. Manage subscription <Link to="/subscription" target="_blank">here</Link>.</PopoverBody>
                </Popover>
                </Label>
                
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
            </FormGroup>

            <FormGroup row>
                <Col sm="4"><CustomInput type="checkbox" id="check_destination_type_email" label="E-mail" checked={destinatinoTypeEmailChecked} onChange={handleDestinationTypeEmailToggle} /></Col>
                <Col sm="8">
                    <Input type="text" placeholder="E-mail destination." defaultValue={emailDestination} onChange={handleEmailDestinationChange} disabled={!destinatinoTypeEmailChecked} valid={getValidEmail()} invalid={getInValidEmail()} />
                </Col>
            </FormGroup>

            <FormGroup row>
                <Col sm="2">
                  <CustomInput type="checkbox" id="check_destination_type_sms" label="SMS" checked={destinatinoTypeSMSChecked} onChange={handleDestinationTypeSMSToggle} disabled={!allowSMSAlert} />
                </Col>
                <Col sm="2">
                  <a type="button" class="btn-tw"><FontAwesomeIcon id="destinatinoTypeSMSHelpPopover" icon="question-circle" /></a>
                  <Popover placement="bottom" isOpen={destinatinoTypeSMSHelpPopoverOpen} target="destinatinoTypeSMSHelpPopover" toggle={handleDestinationTypeSMSHelpPopoverToggle}>
                    <PopoverBody>AMA alert is for paid users only. Manage subscription <Link to="/subscription" target="_blank">here</Link>.</PopoverBody>
                  </Popover>
                </Col>

                <Col sm="8">
                    <Input type="text" placeholder="SMS destination." value={smsDestination} onChange={handleSMSDestinationChange} disabled={!destinatinoTypeSMSChecked} valid={getValidSMS()} invalid={getInValidSMS()} />
                </Col>
            </FormGroup>

        </Container>
        
        </ModalBody>
        <ModalFooter>
          {isAuthenticated && getValidInputs() && (
          <Button color="primary" onClick={handleOk}>Ok</Button>
          )}
          {(!isAuthenticated || !getValidInputs()) && (
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
