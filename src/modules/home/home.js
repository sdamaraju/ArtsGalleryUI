import React, {useEffect, useState} from "react";
import {Form, FormControl} from "react-bootstrap";
import UserProfile from "../user/UserProfile";
import ProductDetail from "../product/ProductDetail";
import AllProducts from "../product/AllProducts";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import ShoppingCart from "../common/ShoppingCart";
import Transactions from "../Orders/Transaction";

function Home(props) {
  const [profilePage, showProfilePage] = useState(false);
  const [newProductDetailModal, showNewProductDetailModal] = useState(false);
  const [userData, setUserData] = useState(props.userData);
  const [userName, setUserName] = useState(props.userData.userName);
  const [openProductDetail, setOpenProductDetail] = useState(false);
  const [product, setProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [refreshHome, setRefreshHome] = useState(true);
  const [enableSearch, setEnableSearch] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState("")

  const displayProfilePage = () => {
    setRefreshHome(false);
    showProfilePage(true);
    showNewProductDetailModal(false);
  }
  const displayNewProductModal = () => {
    setRefreshHome(false);
    showNewProductDetailModal(true);
    showProfilePage(false);
  }

  const displayAllOrders = () => {
    setRefreshHome(false);
    setShowOrderHistory(true);
    showProfilePage(false);
    showNewProductDetailModal(false);
  }

  const openProductDetailModal = (product) => {
    setRefreshHome(false);
    setOpenProductDetail(true);
    setProduct(product);
  }

  return (
    <div>
      <Navbar style={{backgroundColor:"#27476f"}} bg="" expand="lg">
        <Navbar.Brand style={{fontSize:30,fontWeight:"Bold",fontFamily:"cursive",color:"#ffffff"}}>Art-Gallery</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <h3 style={{paddingLeft:30,fontWeight:"bolder",fontFamily:"cursive",color:"#ffffff"}}>Welcome back {userName} !</h3>
          </Nav>
          <Form inline>
            <input style={{width: 400}} type="text" placeholder="search here: let's say Meenakari"
                   onChange={(event) => setFilterCriteria(event.target.value)}
                   className="mr-sm-2" readOnly={enableSearch}/>
            {!enableSearch && <Button variant="outline-info" className="mr-sm-2" onClick={() => {
              setEnableSearch(true);
            }}>Search</Button>}
            {enableSearch && <Button variant="outline-info" className="mr-sm-2" onClick={() => {
              setEnableSearch(false);
            }}>Cancel Search</Button>}
            <Button onClick={() => {
              setShowCart(true);
              setRefreshHome(false)
            }} variant="outline-info">Shopping Cart</Button>
            <NavDropdown title="More options.." id="basic-nav-dropdown" style={{paddingRight: 100,color:"#ffffff"}}>
              <NavDropdown.Item onClick={() => displayProfilePage()}>Profile</NavDropdown.Item>
              {userData.contributor &&
              <NavDropdown.Item onClick={() => displayNewProductModal()}>Add Product</NavDropdown.Item>}
              <NavDropdown.Item onClick={() => displayAllOrders()}>Order History</NavDropdown.Item>
              <NavDropdown.Divider/>
              <NavDropdown.Item onClick={props.logout}>Log out</NavDropdown.Item>
            </NavDropdown>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      <div style={{width: "100%", height: "100%"}}>
        {profilePage && <UserProfile userData={userData} closeProfile={(userData) => {
          showProfilePage(false);
          setUserData(userData);
          setRefreshHome(true)
        }} updateUserName={(value) => setUserName(value) } updateUserData={(data) => setUserData(data)}/>}

        {newProductDetailModal &&
        <ProductDetail userID={userData.userID} closeDetail={() => {
          showNewProductDetailModal(false);
          setRefreshHome(true);
        }} isEditable={true} isNew={true}/>}

        {openProductDetail &&
        <ProductDetail userID={userData.userID} product={product} closeDetail={() => {
          setOpenProductDetail(false);
          setRefreshHome(true);
        }} isEditable={false} isNew={false}/>}

        {refreshHome && enableSearch &&
        <AllProducts openProductDetail={(product) => openProductDetailModal(product)} userID={userData.userID}
                     searchEnabled={enableSearch} filterCriteria={filterCriteria} />}

        {refreshHome && !enableSearch &&
        <AllProducts openProductDetail={(product) => openProductDetailModal(product)} userID={userData.userID}
                     searchEnabled={enableSearch} filterCriteria={filterCriteria} />}

        {showCart && <ShoppingCart closeCart={() => {
          setShowCart(false);
          setRefreshHome(true);
        }} userID={userData.userID} userName={userData.loginID}/>}

        {showOrderHistory && <Transactions userID={userData.userID} closeTransactions={() => {
          setShowOrderHistory(false);
          setRefreshHome(true);
        }}/>}

      </div>
    </div>
  );
}

export default Home;
