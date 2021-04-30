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
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>Art-Gallery</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <h3>Welcome back {userName} !</h3>
          </Nav>
          <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2"/>
            <Button variant="outline-success" className="mr-sm-2">Search</Button>
            <Button onClick={() => {
              setShowCart(true);
              setRefreshHome(false)
            }} variant="outline-info">Shopping Cart</Button>
            <NavDropdown title="More.." id="basic-nav-dropdown" style={{paddingRight: 300}}>
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
      <div style={{width: "100%", height: "100%", paddingTop: 10}}>
        {profilePage && <UserProfile userData={userData} closeProfile={(userData) => {
          showProfilePage(false);
          setUserData(userData);
          setRefreshHome(true)
        }}
                                     updateUserName={(value) => setUserName(value)}/>}
        {newProductDetailModal &&
        <ProductDetail userId={userData.userID} closeDetail={() => {
          showNewProductDetailModal(false);
          setRefreshHome(true);
        }}
                       isEditable={true}
                       isNew={true}/>}
        {openProductDetail &&
        <ProductDetail userId={userData.userID} product={product} closeDetail={() => {
          setOpenProductDetail(false);
          setRefreshHome(true);
        }}
                       isEditable={false}
                       isNew={false}/>}
        {refreshHome &&
        <AllProducts openProductDetail={(product) => openProductDetailModal(product)} userID={userData.userID}/>}
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
