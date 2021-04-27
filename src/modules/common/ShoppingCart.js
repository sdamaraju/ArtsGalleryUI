import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";
import UserProfileStyles from "../styles/CommonStyles";

function ShoppingCart(props) {

  const [rows, setRows] = useState([]);
  const [isStale, setIsStale] = useState(true);
  const [totalSum, setTotalSum] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [products, setProducts] = useState(null);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash-On-Delivery");
  const [addressForDelivery, setAddressForDelivery] = useState("")

  useEffect(async () => {
    if (isStale) {
      let tempData;
      let url = `${serverURL}/shoppingCartProducts?userID=${encodeURIComponent(props.userID)}`;
      await fetch(url).then(response => response.json()).then((data) => {
        tempData = data;
      }).catch((error) => {
        console.log(error);
        alert(error + "\nLooks like the server is down, please try after sometime.");
      });
      if (!isEmpty(tempData) && isEmpty(tempData.error)) {
        createItemList(tempData);
        setProducts(tempData);
        url = `${serverURL}/shoppingCartTotal?userID=${encodeURIComponent(props.userID)}`;
        await fetch(url).then(response => response.json()).then((data) => {
          setTotalSum(data.totalSum);
        }).catch((error) => {
          console.log(error);
          alert(error + "\nLooks like the server is down, please try after sometime.");
        });
      }
      else {
        setTotalSum(0);
      }
      setIsStale(false);
    }
  }, [isStale]);

  const getUserAddress = async () => {
    let url = `${serverURL}/address?userID=${encodeURIComponent(props.userID)}&status='PRIMARY'`;
    await fetch(url).then(response => response.json()).then((data) => {
      console.log(data)
      if (isEmpty(data.error)) {
        setAddressForDelivery(
          data.addr1 + "\n" + data.addr2 + "\n" + data.city + "\n" + data.stateInCountry + "\n" + data.country + "\n" + data.zipCode);
      }
      else {
        alert("User address not found, please enter address for delivery")
      }
    }).catch((error) => {
      console.log(error);
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  const buildOrderList = (orderID) => {
    if (products == null) return [];
    let orderList = []
    let eachOrder = {}
    products.map(product => {
      eachOrder.orderID = orderID;
      eachOrder.productID = product.productID;
      orderList.push(eachOrder);
      eachOrder = {}
    });
    return orderList;
  }

  const createItemList = (data) => {
    setRows([]);
    let counter = 1
    data.forEach((item, idx) => {
      rows[counter] = rows[counter] ? [...rows[counter]] : []
      if (idx % 1 === 0 && idx !== 0) {
        counter++
        rows[counter] = rows[counter] ? [...rows[counter]] : []
        rows[counter].push(item)
      }
      else {
        rows[counter].push(item)
      }
    })
    setRows(rows);
    return rows;
  }

  const deleteCartItem = async (item) => {
    /*confirm("Are you sure about deleting the cart item ?");*/
    setRows([])
    let url = `${serverURL}/shoppingCart?scID=${encodeURIComponent(item.scID)}`;
    const requestOptionsForCartDelete = {
      method: "DELETE",
    };
    await fetch(url, requestOptionsForCartDelete).then(response => response.json()).then((data) => {
      // alert("cart item deleted successfully");
    }).catch((error) => {
      console.log(error);
    });
    setIsStale(true);
  }

  const deleteAllCartItems = async () => {
    /*confirm("Are you sure about deleting the cart item ?");*/
    setRows([])
    let url = `${serverURL}/allShoppingCart?userID=${encodeURIComponent(props.userID)}`;
    const requestOptionsForCartDelete = {
      method: "DELETE",
    };
    await fetch(url, requestOptionsForCartDelete).then(response => response.json()).then((data) => {
      // alert("cart item deleted successfully");
    }).catch((error) => {
      console.log(error);
    });
    setIsStale(true);
  }


  const renderItem = (item, row) => {
    return (
      <div className={"row"}>
        <div className="col" style={{justifyContent: "center"}}>
          <img style={{height: 50, width: 50}} src={`data:image/png;base64,${item.image}`}/>
        </div>
        <div className="col-md-4" style={{justifyContent: "center", width: 150, fontSize: 20}}>
          {item.title}
        </div>
        <div className="col" style={{justifyContent: "center", width: 150, fontSize: 20}}>
          {item.price + ' $'}
        </div>
        <div className="col" style={{justifyContent: "center"}}>
          <input type={"text"} onChange={(event) => updateCartQuantity(event.target.value, item)}
                 value={item.quantity} style={{fontSize: 20, border: 1, width: "100%"}} readOnly={false}/>
        </div>
        <div className="col" style={{justifyContent: "center"}}>
          <input type={"text"} value={item.totalSum + ' $'} style={{fontSize: 20, border: 1, width: "100%"}}
                 readOnly={false}/>
        </div>
        {!checkout && <div>
          <CloseButton onClick={() => deleteCartItem(item)}/>
        </div>}
      </div>
    );
  }

  const updateCartQuantity = async (quantity, item) => {
    setRows([])
    let tempData;
    const requestOptionsForCart = {
      method: "PUT",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        quantity: quantity,
        scID: item.scID
      })
    };
    let url = `${serverURL}/shoppingCart`;
    await fetch(url, requestOptionsForCart).then(response => response.json()).then((data) => {
      tempData = data;
    }).catch((error) => {
      console.log(error);
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
    setIsStale(true);
  }

  const placeOrder = async () => {
    if (window.confirm("Orders once placed cannot be cancelled. Are you sure you want to continue ?")) {
      let currTime = Date.now();
      console.log(currTime)
      console.log(props.userID)
      let orderID = props.userID + currTime;
      console.log(orderID)
      let orderList = buildOrderList(orderID);
      if (!isEmpty(orderList)) {
        const requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(orderList)
        };
        await fetch(`${serverURL}/order`, requestOptions)
          .then(response => response.json())
          .then(async data => {
            const requestOptions = {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                orderID: data.orderID,
                userID: props.userID,
                paymentMethod: paymentMethod,
                status: "Confirmed",
                address: addressForDelivery,
                totalAmount: totalSum,
                dateOfTransaction: Date.now().toString(),
              })
            };
            await fetch(`${serverURL}/transactions`, requestOptions)
              .then(response => response.json())
              .then(async (data) => {
                alert("trx successful", data.TrxID);
                //await updateInventory();
                await deleteAllCartItems();
                props.closeCart();
              }).catch((error) => {
              console.log(error)
            })
          })
          .catch((error) => {
            console.log(error)
            alert(error);
          });
      }
    }
    else {
      return;
    }

  }

  return (
    <Modal show={true} onHide={() => props.closeCart()} size="lg">
      <Modal.Header>
        {!checkout && <Modal.Title>Shopping Cart</Modal.Title>}
        {checkout && <Modal.Title>Final Checkout Details</Modal.Title>}
        <CloseButton onClick={() => {
          props.closeCart();
        }}/>
      </Modal.Header>
      <Modal.Body>
        {/*<div className={"row"}>
            <div className="col" style={{justifyContent: "center", fontSize: 20, color: "orange"}}>
              {"Image"}
            </div>
            <div className="col" style={{justifyContent: "center", fontSize: 20, color: "orange"}}>
              {"Title"}
            </div>
            <div className="col" style={{justifyContent: "center", fontSize: 20, color: "orange"}}>
              {"Price"}
            </div>
            <div className="col" style={{justifyContent: "center", fontSize: 20, color: "orange"}}>
              {"Quantity"}
            </div>
            <div className="col" style={{justifyContent: "center", fontSize: 20, color: "orange"}}>
              {"Total"}
            </div>
          </div>*/}
        {!isEmpty(rows) && <div style={{backgroundColor: "white"}} className="container">
          {Object.keys(rows).map(row => {
            return (
              <div className="row" key={row} style={{padding: 10, alignItems: 'center'}}>
                {rows[row].map(item => {
                  return (
                    renderItem(item, row)
                  )
                })}
              </div>
            );
          })
          }
        </div>}
        {checkout && (
          <div>
            <div className="col-md-6">
              <div className="col-md-6">
                <label>Payment method : </label>
                <input placeholder={"Payment Method"} type="text" value={paymentMethod}
                       onChange={(event) => setPaymentMethod(event.target.value)}
                       style={UserProfileStyles.textBoxComp}
                       required={true} readOnly={true}/>
              </div>
              <div className="col-md-6">
                <div>
                  <label>Delivery Address:</label>
                </div>
                <div>
              <textarea rows={6} placeholder={"Address for delivery"} type="text" value={addressForDelivery}
                        onChange={(event) => setAddressForDelivery(event.target.value)} required={true}
                        readOnly={false}/>
                </div>
              </div>
              <div className={"col"} style={{paddingLeft: 80}}>
                <input type="submit" onClick={async (event) => {
                  event.preventDefault();
                  await getUserAddress();
                }} className="profile-edit-btn" name="btnAddMore"
                       value="Get your address"/>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <label className="mr-sm-2">Total Sum:</label>
          <input className="mr-sm-2" placeholder={"0"} type="text" value={totalSum + "$"}
                 style={{
                   width: 200, justifyContent: "center", textAlign: "center", paddingRight: 10
                 }} required={true}/>
          {!checkout && <input type="submit" onClick={(event) => setCheckout(true)}
                               className="profile-edit-btn"
                               name="btnAddMore"
                               value="Checkout and Pay" disabled={totalSum == 0}/>}
          {checkout && <input type="submit" onClick={async (e) => {
            e.preventDefault();
            await placeOrder();
          }}
                              className="profile-edit-btn"
                              name="btnAddMore"
                              value="Place Order" disabled={totalSum == 0}/>}
          {checkout && <input type="submit" onClick={(event) => setCheckout(false)}
                              className="profile-edit-btn"
                              name="btnAddMore"
                              value="Cancel"/>}

        </div>
      </Modal.Footer>
    </Modal>

  );

}

export default ShoppingCart;