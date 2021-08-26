import React from "react";
import { useState, useEffect } from "react";
import { Alert, Button, Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { isOnLightPlan, isOnPremiumPlan } from "../utils/userProfile";
import { checkoutApiBaseUrl } from "../utils/apiUrls";

const Subscription = () => {
    const {
      isAuthenticated,
      getAccessTokenSilently,
      loginWithRedirect,
      user,
    } = useAuth0();

    const [subscriptionData, setSubscriptionData] = useState({});
    const [lightCheckoutUrl, setLightCheckoutUrl] = useState('');
    const [premiumCheckoutUrl, setPremiumCheckoutUrl] = useState('');
    const [portalUrl, setPortalUrl] = useState('');
    const [shouldActivateJoinFreeTier, setShouldActivateJoinFreeTier] = useState(false);  
    const [shouldActivateJoinLightTier, setShouldActivateJoinLightTier] = useState(false);  
    const [shouldActivateJoinPremiumTier, setShouldActivateJoinPremiumTier] = useState(false);    

    const checkoutSessionUrl = `${checkoutApiBaseUrl}/checkout`
    const subscriptionPortalRetrieveUrl = `${checkoutApiBaseUrl}/portal`

    const updateSubscriptionData = async (user) => {
        if (!isAuthenticated) {
            return
        }
        const getUserApiPath = (user) => `${checkoutApiBaseUrl}/users/${user?.sub?.split('auth0|').slice(-1)[0]}/stripe_customer?email=${user?.email}`;    
        const token = await getAccessTokenSilently();
        const response = await fetch(getUserApiPath(user), {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        const response_json = await response.json();
        setSubscriptionData(response_json);
    };

    const updateSubscriptionPortalUrl = async () => {
        if (!isAuthenticated || !('stripe_customer_id' in subscriptionData)) {
            return;
        }
        try {
            const token = await getAccessTokenSilently();
            const uri = `${subscriptionPortalRetrieveUrl}?price_type=light&callback_url=https://google.com&customer_id=${subscriptionData?.stripe_customer_id}`
            const uri_encoded = encodeURI(uri)
            const response = await fetch(uri_encoded, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                method: 'POST'
                });
            const url = await response.json()
            setPortalUrl(url)
        } catch (error) {
            console.error(error);
        }
    };

    const updateCheckoutlUrl = async (tier) => {
        if (!isAuthenticated || !('stripe_customer_id' in subscriptionData)) {
            return;
        }
        try {
            const token = await getAccessTokenSilently();
            const uri = `${checkoutSessionUrl}?price_type=${tier}&callback_url=https://google.com&customer_id=${subscriptionData?.stripe_customer_id}`
            const uri_encoded = encodeURI(uri)
            const response = await fetch(uri_encoded, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                method: 'POST'
                });
            const url = await response.json()
            if (tier === 'light') {
                setLightCheckoutUrl(url)
            }
            if (tier === 'premium') {
                setPremiumCheckoutUrl(url)
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFree = async () => {
        console.log('subscriptionData:', subscriptionData)
        loginWithRedirect();
    };

    const handleLight = async () => {
        if (lightCheckoutUrl === '') {
            return;
        }
        window.location.href = lightCheckoutUrl
    };

    const handlePremium = async () => {
        if (premiumCheckoutUrl === '') {
            return;
        }
        window.location.href = premiumCheckoutUrl 
    };

    useEffect(() => {
        let shouldActivate = false;
        if (!isAuthenticated) {
        }
        else if (lightCheckoutUrl === '') {
        }
        else if (isOnLightPlan(subscriptionData?.subscriptions)) {
        }
        else if (isOnPremiumPlan(subscriptionData?.subscriptions)) {
        } else  {
            shouldActivate = true;
        }
        setShouldActivateJoinLightTier(shouldActivate);
    }, [isAuthenticated, lightCheckoutUrl, subscriptionData]); 

    useEffect(() => {
        let shouldActivate = false;
        if (!isAuthenticated) {
        }
        else if (premiumCheckoutUrl === '') {
        }
        else if (isOnLightPlan(subscriptionData?.subscriptions)) {
            shouldActivate = true;
        }
        else if (isOnPremiumPlan(subscriptionData?.subscriptions)) {
        } else  {
            shouldActivate = true;
        }
        setShouldActivateJoinPremiumTier(shouldActivate);
    }, [isAuthenticated, premiumCheckoutUrl, subscriptionData]); 

    useEffect(() => {
        let shouldActivate = false;
        if (!isAuthenticated) {
            shouldActivate = true;
        }
        setShouldActivateJoinFreeTier(shouldActivate);
    }, [isAuthenticated]); 

    useEffect(() => {
        updateSubscriptionData(user);
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        updateCheckoutlUrl('light');
        updateCheckoutlUrl('premium');
        updateSubscriptionPortalUrl();
    }, [subscriptionData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        console.log('subscriptionData:', subscriptionData)
    }, [subscriptionData]); // eslint-disable-line react-hooks/exhaustive-deps

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
                        {isOnLightPlan(subscriptionData?.subscriptions) && (<span>On Light plan</span>)}
                        {isOnPremiumPlan(subscriptionData?.subscriptions) && (<span>On Premium plan</span>)}
                        {portalUrl !== '' && (<span> (<a href={portalUrl}>manage subscription</a>)</span>)}
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
                    20$ / Month
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
                    50$ / Month
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
                    {!shouldActivateJoinFreeTier && (<Button color="primary" size="lg" disabled>Start For Free</Button>)}
                    {shouldActivateJoinFreeTier && (<Button color="primary" size="lg" onClick={handleFree}>Start For Free</Button>)}
                </Col>
                <Col sm="4">
                    {!shouldActivateJoinLightTier && (<Button color="success" size="lg" disabled>Join Light Tier</Button>)}
                    {shouldActivateJoinLightTier && (<Button color="success" size="lg" onClick={handleLight}>Join Light Tier</Button>)}
                </Col>
                <Col sm="4">
                    {!shouldActivateJoinPremiumTier && (<Button color="danger" size="lg" disabled>Join Premium Tier</Button>)}
                    {shouldActivateJoinPremiumTier && (<Button color="danger" size="lg" onClick={handlePremium}>Join Premium Tier</Button>)}
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
