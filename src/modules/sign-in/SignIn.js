import React, {useEffect, useState} from "react";
import signInImage from "../../assets/images/PaintingsCollage.png";
import Home from "../home/home";
import {isEmpty} from "../utils/util";
import {serverURL} from "../../app.constants"
import SignUp from "./SignUp";
import Button from "react-bootstrap/Button";

const SignIn = (props) => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [failedLogin, setFailedLogIn] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  //Remove this..just for test
  useEffect(() => {
    setLoginID("sdamaraju");
    setPassword("Password@123");
  }, []);

  const login = () => {
    setFailedLogIn(false);
    let url = `${serverURL}/user?loginID=${encodeURIComponent(loginID)}&password=${encodeURIComponent(
      password)}`
    fetch(url).then(response => response.json()).then((data) => {
      if (isEmpty(data.error)) {
        setUserData(data);
        setLoggedIn(true);
      }
      else {
        setFailedLogIn(true);
        setLoginID("");
        setPassword("");
      }
    }).catch((error) => {
      console.log(error);
      alert(error+ "\nLooks like the server is down, please try after sometime.");
    });
  }

  const logout = () => {
    setLoggedIn(false);
    setUserData({});
  }

  return (
    <div style={{
      backgroundColor:'pink',
    }}>
      <div style={{top: 1000}}>
        {!loggedIn && (
          <h1 style={{
            fontStyle: "",
            backgroundColor: "pink",
            color: "white"
          }}> Welcome to Art Gallery </h1>
        )}
        {!loggedIn && !showSignUpModal && (
          <form>
            <label>
              <input placeholder={"Log In ID"} type="text" value={loginID} style={{height: 30, width: 200}}
                     onChange={(event) => setLoginID(event.target.value)} required={true}/><br/>
              <input placeholder={"Password"} type="password" value={password} style={{height: 30, width: 200}}
                     onChange={(event) => setPassword(event.target.value)} required={true}/><br/>
            </label>
            <br/>
            <Button onClick={async (event) => {
              event.preventDefault();
              await login();
            }} variant="primary">Sign in</Button>
            <Button onClick={() => {
              setShowSignUpModal(true);
              console.log("Wassup..")
            }} variant="secondary">Sign up</Button>
          </form>
        )}
        {failedLogin && <text style={{color: "Red"}}> Username/password did not match</text>}
        {showSignUpModal && <SignUp closeSignUpModal={() => setShowSignUpModal(false)}/>}
        {loggedIn && <Home userData={userData} logout={() => logout()}/>}
      </div>
    </div>
  );
}
export default SignIn;