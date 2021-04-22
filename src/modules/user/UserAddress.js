import UserProfileStyles from "../styles/CommonStyles";
import React, {useEffect, useState} from "react";
import {isEmpty} from "../utils/util";
import {serverURL} from "../../app.constants"

function UserAddress(props) {

  const [addrData, setAddrData] = useState(null);
  const [addr1, setAddr1] = useState(!isEmpty(addrData) ? addrData.addr1 : "");
  const [addr2, setAddr2] = useState(!isEmpty(addrData) ? addrData.addr2 : "");
  const [city, setCity] = useState(!isEmpty(addrData) ? addrData.city : "");
  const [stateInCountry, setStateInCountry] = useState(!isEmpty(addrData) ? addrData.stateInCountry : "");
  const [zipCode, setZipCode] = useState(!isEmpty(addrData) ? addrData.zipCode : "");
  const [country, setCountry] = useState(!isEmpty(addrData) ? addrData.country : "");
  const [userid, setUserid] = useState(!isEmpty(addrData) ? addrData.userid : "");
  const [aid, setAid] = useState(!isEmpty(addrData) ? addrData.aid : "");
  const [status, setStatus] = useState(!isEmpty(addrData) ? addrData.status : "");
  const isEditable = props.isEditable;

  useEffect(async () => {
    if (isEmpty(addrData)) {
      let url = `${serverURL}/address?userID=${encodeURIComponent(props.userId)}&status=${encodeURIComponent(
        "PRIMARY")}`
    await  fetch(url, {
        method: 'GET'
      }).then(resp => resp.json()).then((data) => {
        setAddrData(data);
      });
    }
  }, [props.userId]);

  useEffect(async () => {
    if (props.save) {
      const requestOptions = {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          addr1: addr1,
          addr2: addr2,
          city: city,
          stateInCountry: stateInCountry,
          country: country,
          zipCode:zipCode,
          status:status,
          aid:aid,
        })
      };
      let url = `${serverURL}/address`
     await fetch(url, requestOptions).then(resp => resp.json()).then((data) => {
        setAddrData(data);
      });
      props.resetSaveCalled();
    }
  }, [props.save]);

  useEffect(async () => {
    if (!isEmpty(addrData)) {
      setAddr1(addrData.addr1);
      setAddr2(addrData.addr2);
      setCity(addrData.city);
      setCountry(addrData.country);
      setStateInCountry(addrData.stateInCountry);
      setZipCode(addrData.zipCode);
      setUserid(addrData.userid);
      setAid(addrData.aid);
      setStatus(addrData.status);
    }
  }, [addrData]);

  return (
    <div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>Address Line 1</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"Address Line 1"} type="text" value={addr1}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setAddr1(event.target.value)} required={true} readOnly={!isEditable}/>
        </div>
      </div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>Address Line 2</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"Address Line 2"} type="text" value={addr2}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setAddr2(event.target.value)} required={true} readOnly={!isEditable}/>
        </div>
      </div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>City</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"City"} type="text" value={city}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setCity(event.target.value)} required={true} readOnly={!isEditable}/>
        </div>
      </div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>State</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"State"} type="text" value={stateInCountry}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setStateInCountry(event.target.value)} required={true}
                 readOnly={!isEditable}/>
        </div>
      </div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>Country</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"Country"} type="text" value={country}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setCountry(event.target.value)} required={true} readOnly={!isEditable}/>
        </div>
      </div>
      <div className="row" style={{padding: 5}}>
        <div className="col-md-6">
          <label>ZipCode</label>
        </div>
        <div className="col-md-6">
          <input placeholder={"Zip Code"} type="text" value={zipCode}
                 style={UserProfileStyles.textBoxComp}
                 onChange={(event) => setZipCode(event.target.value)} required={true} readOnly={!isEditable}/>
        </div>
      </div>
    </div>
  );
}

export default UserAddress;
