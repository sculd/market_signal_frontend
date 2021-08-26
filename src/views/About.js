import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Container } from "reactstrap";
import { contactEmail } from "../utils/constants";

const About = () => (
  <Container className="mb-5">
    <Fragment>
      <div>
      <h1>About</h1>
      <p>
      Need Support?
      </p>
      <p>
      If you are looking for help with an existing account, please email {contactEmail}.          
      </p>
      <h4>Legal</h4>
      <p>
          <Link to="/terms" target="_blank">Terms of service</Link>
      </p>
      <p>
          <Link to="/privacy" target="_blank">Privacy policy</Link>
      </p>
      <p>
          <Link to="/eula" target="_blank">EULA</Link>
      </p>
      </div>
    </Fragment>
  </Container>
);

export default About;
