import React, {useEffect, useState} from "react";
import signInImage from "../../assets/images/pastel-background-last.jpg";
import Home from "../home/home";
import {isEmpty} from "../utils/util";
import {serverURL} from "../../app.constants"
import SignUp from "./SignUp";
import Button from "react-bootstrap/Button";
import CommonStyles from "../styles/CommonStyles";

const SignIn = (props) => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [failedLogin, setFailedLogIn] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  //Remove this..just for test
  useEffect(() => {
    if(!loggedIn){
      let userSession = sessionStorage.getItem("userSession");
      if(!isEmpty(userSession)){
        setUserData(JSON.parse(userSession));
        setLoggedIn(true);
      }
    }
    else {
      sessionStorage.setItem("userSession",JSON.stringify(userData));
    }
  }, [loggedIn]);

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
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  const logout = () => {
    setLoggedIn(false);
    sessionStorage.removeItem("userSession");
    setUserData({});
  }

  return (
    <div >
      <div>
        {!loggedIn && <div style={{top: 1000 ,
          backgroundImage: `url(${signInImage})`,
          backgroundSize: 'cover',
        }}>
        {!loggedIn && (
          <h1 style={{
            fontStyle: "",
            color: "Black",
            fontFamily: "cursive",
            fontSize: 50,
            paddingBottom: 100

          }}> Welcome to Art Gallery </h1>
        )}
        {!loggedIn && !showSignUpModal && (
          <form>
            <label>
              <label style={CommonStyles.searchField}>Login ID</label>
              <br/>
              <input placeholder={"Enter your Login ID"} type="text" value={loginID} style={{
                height: 30,
                width: 200,
                paddingLeft: 10,
                paddingTop: 10,
                paddingBottom: 10,
                textAlign: "Center"
              }}
                     onChange={(event) => setLoginID(event.target.value)} required={true}/><br/>
              <label style={CommonStyles.searchField}>Password</label>
              <br/>
              <input placeholder={"Enter your Password"} type="password" value={password} style={{
                height: 30,
                width: 200,
                paddingLeft: 10,
                paddingTop: 10,
                paddingBottom: 10,
                textAlign: "Center"
              }}
                     onChange={(event) => setPassword(event.target.value)} required={true}/><br/>
            </label>
            <br/>
            <div>
              <div style={{paddingBottom: 10, paddingTop: 10}}>
                <Button onClick={async (event) => {
                  event.preventDefault();
                  await login();
                }} variant="primary" style={{}}>Sign in</Button>
              </div>
              <div>
                <Button onClick={() => {
                  setShowSignUpModal(true);
                }} variant="secondary">Register</Button>
              </div>
            </div>
          </form>
        )}
        {failedLogin && <text style={{color: "Red"}}> Username/password did not match</text>}
        {showSignUpModal && <SignUp closeSignUpModal={() => setShowSignUpModal(false)}/>}
        <div style={{paddingTop: 1000}}></div>
      </div>}
      <div style={{
        backgroundColor: "Pink",
        backgroundSize: 'cover',}}>
        {loggedIn && <Home userData={userData} logout={() => logout()}/>}
      </div>
      </div>
    </div>
  );
}
export default SignIn;