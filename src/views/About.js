import React, { Fragment } from "react";
import { Container } from "reactstrap";

const About = () => (
  <Container className="mb-5">
    <Fragment>
      <div>
      <h1>About</h1>
      <p>
          Market signal picker detects the big market movers in "real" time.
          So that "you" can profit from the big opportunities.
      </p>
      <p>
          <a href="mailto:me@example.com">me@example.com</a>
      </p>
      </div>
    </Fragment>
  </Container>
);

export default About;
