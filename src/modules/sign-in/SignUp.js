import UserProfileStyles from "../styles/CommonStyles";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useState} from "react";
import {isEmpty} from "../utils/util";
import {serverURL} from "../../app.constants";
import Modal from "react-bootstrap/Modal";

function SignUp(props) {
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginID, setLoginID] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loginIDExists, setLoginIDExists] = useState(false);
  const [contributor, setContributor] = useState(false);

  async function createUser() {
    if (password != confirmPassword) {
      setPasswordMismatch(true);
      setConfirmPassword("");
      return false;
    }
    const requestOptions = {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userName: userName,
        password: password,
        phone: phone,
        email: email,
        loginID: loginID,
      })
    };
    await fetch(`${serverURL}/user`, requestOptions)
      .then(response => response.json())
      .then(data => {
        if (!isEmpty(data.error)) {
          setLoginIDExists(true);
        }
        else {
          alert("User created successfully, please sign in");
          props.closeSignUpModal();
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  return (
    <Modal show={true} onHide={() => props.closeSignUpModal()} size="lg">
      <Modal.Header>
        <Modal.Title>New User</Modal.Title>
        <CloseButton onClick={() => {
          props.closeSignUpModal();
        }}/>
      </Modal.Header>
      <Modal.Body>
        <div style={{backgroundColor: "white", opacity: 1}}>
          <form method="post">
            <div className="row" style={{paddingTop: 10}}>
              <div className="col-md-12" style={{alignItems: "right"}}>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>User Name</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"User name"} type="text" value={userName}
                           style={UserProfileStyles.textBoxComp}
                           onChange={(event) => setUserName(event.target.value)} required={true}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Login ID</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Preferred Login ID"} style={UserProfileStyles.textBoxComp} type="text" value={loginID}
                              onChange={(event) => {
                                setLoginID(event.target.value);
                                setLoginIDExists(false)
                              }} required={true}/>
                  </div>
                </div>
                {loginIDExists &&
                <text style={{color: "Red"}}> Preferred Login ID exists, please select a new LoginID</text>}
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Password</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Password"} type="password" value={password}
                           style={UserProfileStyles.textBoxComp}
                           onChange={(event) => setPassword(event.target.value)} required={true}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Confirm Password</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Confirm password"} type="password" value={confirmPassword}
                           style={UserProfileStyles.textBoxComp} onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPasswordMismatch(false)
                    }}
                           required={true}/>
                  </div>
                </div>
                {passwordMismatch && <text style={{color: "Red"}}> Password / Confirm Password, did not match</text>}
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Phone</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Phone number"} type="text" value={phone}
                           onChange={(event) => setPhone(event.target.value)}
                           style={UserProfileStyles.textBoxComp}
                           required={true}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Email</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Email"} type="text" value={email}
                           onChange={(event) => setEmail(event.target.value)}
                           style={UserProfileStyles.textBoxComp}
                           required={true}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Would you like to sell your art products ?</label>
                  </div>
                  <div className="col-md-6">
                    <input  type="checkbox" value={contributor}
                            style={UserProfileStyles.checkBoxComp}
                           onChange={(event) => setContributor(event.target.value)}
                           required={true}/>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className={"text-start"}>
          <input type="submit" onClick={async (event) => {
            event.preventDefault()
            await createUser()
          }}
                 className="btn-warning" name="btnAddMore"
                 value="Create your account"/>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default SignUp;