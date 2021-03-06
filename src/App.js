import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Chart from "./views/Chart";
import Alert from "./views/Alert";
import Subscription from "./views/Subscription";
import About from "./views/About";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import Terms from "./views/Terms";
import Privacy from "./views/Privacy";
import EULA from "./views/EULA";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="flex-column h-100 w-100">
        <NavBar />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/chart" exact component={Chart} />
            <Route path="/alert" exact component={Alert} />
            <Route path="/subscription" exact component={Subscription} />
            <Route path="/about" exact component={About} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/eula" component={EULA} />
          </Switch>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
