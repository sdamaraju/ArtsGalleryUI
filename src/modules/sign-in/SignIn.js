import React, {useEffect, useState} from "react";
import signInImage from "../../assets/images/PaintingsCollage.png";
import Home from "../home/home";
import {isEmpty} from "../utils/util";
import {serverURL} from "../../app.constants"

const SignIn = (props) => {
  const [loginID, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [failedLogin, setFailedLogIn] = useState(false);

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
      backgroundImage: `url(${signInImage})`,
      backgroundSize: 'cover',
      width: '100vw',
      height: '100vh',
    }}>
      <div style={{top: 1000}}>
        {!loggedIn && (
          <h1 style={{
            fontStyle: "",
            backgroundColor: "black",
            color: "white"
          }}> Welcome to Art Gallery </h1>
        )}
        {!loggedIn && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            await login()
          }}>
            <label>
              <input placeholder={"Log In ID"} type="text" value={loginID} style={{height: 30, width: 200}}
                     onChange={(event) => setLoginID(event.target.value)} required={true}/><br/>
              <input placeholder={"Password"} type="password" value={password} style={{height: 30, width: 200}}
                     onChange={(event) => setPassword(event.target.value)} required={true}/><br/>
            </label>
            <br/>
            <input type="submit" value="Sign In" style={{height: 30, width: 200}}/>
          </form>
        )}
        {failedLogin && <text style={{color: "Red"}}> Username/password did not match</text>}
        {loggedIn && <Home userData={userData} logout={() => logout()}/>}
      </div>
    </div>
  );
}
export default SignIn;