import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Home from "./components/Todos";
import About from "./components/About";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/data-fetching";

export default function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <div id="app" className="h-screen pt-8 bg-gray-300">
        <Router>
          <div className="max-w-sm mx-auto">
            <header className="pb-8">
              <NavLink
                exact
                to="/"
                className="pb-1 mr-4"
                activeClassName="border-b-2 border-gray-700"
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className="pb-1"
                activeClassName="border-b-2 border-gray-700"
              >
                About
              </NavLink>
            </header>

            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route path="/about">
                <About />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    </SWRConfig>
  );
}
