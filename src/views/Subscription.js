import React from "react";
import { useState, useEffect } from "react";
import { Alert, Button, Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { getUserMetadata } from "../utils/userProfile";
import contentData from "../utils/contentData";


const Subscription = () => {
    const {
      isAuthenticated,
      getAccessTokenSilently,
      loginWithRedirect,
      user,
    } = useAuth0();

    const checkoutSessionUrl = "https://v0hauynbz7.execute-api.us-east-2.amazonaws.com/test/checkout"

    const handleFree = async () => {
        if (!isAuthenticated) {
            loginWithRedirect()
        }
        console.log('user:', user)
        const token = await getAccessTokenSilently();
        console.log('contentData:', contentData)
        const user_metadata = await getUserMetadata(user, token)
        console.log('user_metadata:', user_metadata)
    };

    const handleLight = async () => {
        if (!isAuthenticated) {
            loginWithRedirect()
            return;
        }
        const token = await getAccessTokenSilently();
        const uri = `${checkoutSessionUrl}?price_type=light&callback_url=https://google.com`
        const uri_encoded = encodeURI(uri)
        const response = await fetch(uri_encoded, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'POST'
        });
        const body = await response.json()
        // why not using redirect?
        // https://stackoverflow.com/questions/68630229/stripe-checkout-example-running-into-cors-error-from-localhost
        window.location.href = body
    };

    const handlePremium = async () => {
        if (!isAuthenticated) {
            loginWithRedirect()
            return;
        }
        const token = await getAccessTokenSilently();
        const uri = `${checkoutSessionUrl}?price_type=premium&callback_url=https://google.com`
        const uri_encoded = encodeURI(uri)
        const response = await fetch(uri_encoded, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'POST'
        });
        const body = await response.json()
        window.location.href = body
    };
            
    return (
        <div>
          {isAuthenticated && (
            <div>
                <Container className="mb-5">
                    <Row className="align-items-center profile-header mb-5 text-center text-md-left">
                    <Col md={2}>
                        <img
                        src={user.picture}
                        alt="Profile"
                        className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
                        />
                    </Col>
                    <Col md>
                        <h2>{user.name}</h2>
                        <p className="lead text-muted">{user.email}</p>
                    </Col>
                    </Row>
                </Container>
                <hr />
            </div>
          )}
          <Container className="mb-5">
              <h2 className="my-5 text-center">Pricing</h2>
              <Alert color="warning">
                The service is under development and the billing is for testing purpose.
              </Alert>
              <Row className="d-flex justify-content-between">
                <Col sm="4">
                    <ListGroup>
                    <ListGroupItem>
                    <h6 className="mb-3">Basic</h6>
                    0$
                    </ListGroupItem>
                    <ListGroupItem>
                    <p>For all development and testing of personal or commercial projects.</p>
                    </ListGroupItem>
                    </ListGroup>
                </Col>
                <Col sm="4">
                    <ListGroup>
                    <ListGroupItem>
                    <h6 className="mb-3">Light</h6>
                    20$
                    </ListGroupItem>
                    <ListGroupItem>
                    <p>For production and published commercial projects.</p>
                    </ListGroupItem>
                    </ListGroup>
                </Col>
                <Col sm="4">
                    <ListGroup>
                    <ListGroupItem>
                    <h6 className="mb-3">Premium</h6>
                    50$
                    </ListGroupItem>
                    <ListGroupItem>
                    <p>For enterprise projects that require exceptional resources and support.</p>
                    </ListGroupItem>
                    </ListGroup>
                </Col>
              </Row>
              <br />
              <Row className="d-flex justify-content-between">
                <Col sm="4">
                    <ListGroupItem>3 Email Alerts</ListGroupItem>
                </Col>
                <Col sm="4">
                    <ListGroupItem>20 SMS & Email Alerts</ListGroupItem>
                </Col>
                <Col sm="4">
                    <ListGroupItem>100 SMS & Email Alerts</ListGroupItem>
                </Col>
              </Row>
              <br />
              <Row className="d-flex justify-content-between text-center">
                <Col sm="4">
                    <Button color="primary" size="lg" onClick={handleFree}>Start With Free</Button>
                </Col>
                <Col sm="4">
                    <Button color="success" size="lg" onClick={handleLight}>Start With Light</Button>
                </Col>
                <Col sm="4">
                    <Button color="danger" size="lg" onClick={handlePremium}>Start With Premium</Button>
                </Col>
              </Row>
          </Container>

          <hr />
          <Container className="mb-5">
          <h2 className="my-5 text-center">FAQ</h2>
              <Row className="d-flex justify-content-between">
              <Col sm="1">
              </Col>
              <Col sm="10">
                <ListGroupItem>
                <p>
                <b>What usage does the Basic plan permit?</b>
                </p>
                <p>
                The Developer plan may be used for development and testing in a development environment only, and cannot be used in a staging or production environment (including internally). When the API is used outside of a development environment an upgrade to one of our subscriptions will be required to continue using the API.
                </p>

                <p>
                <b>Can I pay via invoice and ACH/bank transfer?</b>
                </p>
                <p>
                Yes! For annual subscriptions we can accept these payment methods.
                </p>

                <p>
                <b>Can I cancel at any time?</b>
                </p>
                <p>
                Of course! When you cancel, your plan will run until the end of the current paid period and you won't be charged again.
                </p>
                </ListGroupItem>
                </Col>
                <Col sm="1">
                </Col>
              </Row>
          </Container>
        </div>
    );
}

export default Subscription;
