import React, {useState} from "react";
import UserProfileStyles from "../styles/CommonStyles";
import UserAddress from "./UserAddress";
import {serverURL} from "../../app.constants"
import {isEmpty} from "../utils/util";
import CloseButton from "react-bootstrap/CloseButton";

function UserProfile(props) {
  const [isEditable, setIsEditable] = useState(false);
  const [userName, setUserName] = useState(props.userData.userName);
  const [email, setEmail] = useState(props.userData.email);
  const [phoneNumber, setPhoneNumber] = useState(props.userData.phoneNumber);
  const [password, setPassword] = useState(props.userData.password);
  const [confirmPassword, setConfirmPassword] = useState(props.userData.password);
  const [loginID, setLoginID] = useState(props.userData.loginID);
  const [changePhoto, setChangePhoto] = useState(false);
  const [photo, setPhoto] = useState(props.userData.photo)
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveCalled, setSaveCalled] = useState(false);
  //const [photoType,setPhotoType] = useState(""); Might have to revisit photoType for other than png photos..

  const saveUser = () => {
    setSaveCalled(true);
    if (password !== confirmPassword) {
      alert("Password and Confirmation Password did not match");
      setConfirmPassword("");
      return false;
    }
    else {
      const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userName: userName,
          userId: props.userData.userID,
          email: email,
          phoneNumber: phoneNumber,
          password: password,
          loginID: loginID,
        })
      };
      fetch(`${serverURL}/user`, requestOptions)
        .then(response => response.json())
        .then(data => {
          //alert("Profile updated successfully.");
          props.updateUserName(data.userName);
        })
        .catch((error) => {
          console.log(error)
          alert(error);
        });
      setIsEditable(false);
      setChangePhoto(false);
    }
  }
  const uploadUserPicture = () => {
    var formData = new FormData();
    formData.append('loginID', loginID);
    formData.append('photo', selectedFile);
    fetch(`${serverURL}/userImage`, {
      method: 'PUT',
      body: formData
    }).then(resp => resp.json()).then((data) => {
      if (!isEmpty(data.error)) {
        alert(data.error + "\nLooks like there is an issue with the image, image not updated");
        setChangePhoto(false);
      }
      else {
        setPhoto(data.photo);
        /*let strings = data.photo.split(",");
        let extension;
        switch (strings[0]) {//check image's extension
          case "data:image/jpeg;base64":
            extension = "jpeg";
            break;
          case "data:image/png;base64":
            extension = "png";
            break;
          default://should write cases for more images types
            extension = "jpg";
            break;
        }
        setPhotoType(extension);*/
        setChangePhoto(false);
        setSelectedFile(null);
        //alert(data.userName + "'s profile image updated.");
      }
    }).catch((error) => {
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }
  return (
    <div style={{backgroundColor: "white", opacity: 0.9}}>
      <form method="post">
        <div className="row" style={{paddingTop: 10}}>
          <div className="col-md-4">
            <div className="profile-img">
              <img style={{height: 180, width: 200, paddingBottom: 10}} src={`data:image/png;base64,${photo}`}/>
              <div style={{paddingBottom: 5}}>
                <button type="button" onClick={() => setChangePhoto(true)} className="btn btn-secondary">Change Photo
                </button>
              </div>
              {changePhoto &&
              <div>
                <div className="row-cols-2">
                  <input type="file" onChange={(event) => {
                    setSelectedFile(event.target.files[0])
                  }}/>
                  <button type="button" onClick={() => {
                    setChangePhoto(false);
                    setSelectedFile(null)
                  }} className="btn btn-secondary">Cancel
                  </button>
                </div>
                {selectedFile && <button type="button" onClick={async (e) => {
                  e.preventDefault();
                  await uploadUserPicture();
                }} className="btn btn-primary">Upload
                </button>}
              </div>
              }
            </div>
          </div>
          <div className="col-md-5">
            {/*<div className="profile-head">
              <h6>
                Get User Role here..
              </h6>
            </div>*/}
            <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>User Id</label>
              </div>
              <div className="col-md-6">
                <input type="text" value={loginID}
                       style={UserProfileStyles.textBoxComp}
                       readOnly={true}
                       autoFocus={true}/>
              </div>
            </div>
            <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>User Name</label>
              </div>
              <div className="col-md-6">
                <input placeholder={"Username"} type="text" value={userName}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => setUserName(event.target.value)} required={true} readOnly={!isEditable}/>
              </div>
            </div>
            <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>Email Id</label>
              </div>
              <div className="col-md-6">
                <input placeholder={"Email"} type="text" value={email}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => setEmail(event.target.value)} required={true} readOnly={!isEditable}/>
              </div>
            </div>
            <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>Phone</label>
              </div>
              <div className="col-md-6">
                <input placeholder={"Phone"} type="text" value={phoneNumber}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => setPhoneNumber(event.target.value)} required={true} readOnly={!isEditable}/>
              </div>
            </div>
            <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>Password</label>
              </div>
              <div className="col-md-6">
                <input placeholder={"Password"} type="password" value={password}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => setPassword(event.target.value)} required={true} readOnly={!isEditable}/>
              </div>
            </div>
            {isEditable && <div className="row" style={{padding: 5}}>
              <div className="col-md-6">
                <label>Confirm Password</label>
              </div>
              <div className="col-md-6">
                <input placeholder={"Confirm Password"} type="password" value={confirmPassword}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => setConfirmPassword(event.target.value)} required={true}
                       readOnly={!isEditable}/>
              </div>
            </div>}
            <UserAddress userId={props.userData.userID} isEditable={isEditable} save={saveCalled} resetSaveCalled={() => setSaveCalled(false)}/>
          </div>
          <div className="col-md-1">
            {!isEditable &&
            <input type="submit" onClick={() => setIsEditable(true)} className="profile-edit-btn" name="btnAddMore"
                   value="Edit Profile"/>}
            {
              isEditable &&
              <input type="submit" onClick={async (event) => {
                event.preventDefault();
                await saveUser();
              }} className="profile-edit-btn" name="btnAddMore"
                     value="Save Profile"/>
            }
          </div>
          <div className={"col-md-1"}>
            <CloseButton onClick={() => {
              setIsEditable(false);
              props.closeProfile()
            }}/>
          </div>
        </div>
      </form>
    </div>
  )
    ;
}

export default UserProfile;
