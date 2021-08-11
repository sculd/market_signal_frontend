import React from "react";
import { useState, useEffect } from "react";
import { Container } from 'reactstrap';
import { Spinner, Table } from 'reactstrap';
import { useAuth0 } from "@auth0/auth0-react";
import AlertBuilder from "../components/AlertBuilder";
import AlertDelete from "../components/AlertDelete";

const Alert = () => {
    const [apiState, setApiState] = useState({
      showResult: false,
      apiMessage: "",
      error: null,
      isLoading: false,
    });
  
    const alertApiOrigin = "https://ynpz1kpon8.execute-api.us-east-2.amazonaws.com/test";
    const {
      isAuthenticated,
      getAccessTokenSilently,
      loginWithPopup,
      getAccessTokenWithPopup,
      user,
    } = useAuth0();

    const callApi = async () => {
        if (!isAuthenticated) {
            setApiState({
              ...apiState,
              isLoading: false,
            });
            return;
        }

        try {
          const token = await getAccessTokenSilently();
    
          const response = await fetch(`${alertApiOrigin}/users/${user.sub.split("auth0|").pop()}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const responseData = await response.json();
          console.log('responseData:', responseData)
          setApiState({
            ...apiState,
            showResult: true,
            apiMessage: responseData,
            isLoading: false,
          });
          console.log('apiState (after responseData):', apiState)
        } catch (error) {
            setApiState({
            ...apiState,
            error: error.error,
            isLoading: false,
          });
        }
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
    
    useEffect(() => {
        setApiState({
            ...apiState,
            isLoading: true,
          });
        callApi();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePost = (alert) => {
        setApiState({
            ...apiState,
            isLoading: true,
          });
        callApi();
    };

    const handleDelete = (alert) => {
        setApiState({
            ...apiState,
            isLoading: true,
          });
        callApi();
    };

    return (
        <Container className="mb-5">
            <div>
            <h1>Alert{"  "}
            {apiState.isLoading && (
                <Spinner color="primary" />
            )}
            </h1>
            <p>
            </p>

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

            <Table>
            <thead>
                <tr>
                <th>#</th>
                <th>Alert Name</th>
                <th>Summary</th>
                <th>Edit</th>
                <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {(apiState.apiMessage.alerts || []).map((alert, i) => (
                    <tr key={"alert_" + i}>
                        <th scope="row">{i}</th>
                        <td>{alert.alert_name}</td>
                        <td>{alert.description}</td>
                        <td>
                            <AlertBuilder alert={alert} after_ok={handlePost}>edit</AlertBuilder>
                        </td>
                        <td>
                            <AlertDelete list_index={i} alert={alert} after_ok={handleDelete}>delete</AlertDelete>
                        </td>
                    </tr>
                ))}
            </tbody>
            </Table>
            <AlertBuilder alert={undefined} after_ok={handlePost}>add a new alert</AlertBuilder>
            </div>
        </Container>
    );
}

export default Alert;
