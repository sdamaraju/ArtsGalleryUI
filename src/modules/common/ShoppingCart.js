import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty, rowStyle} from "../utils/util";
import UserProfileStyles from "../styles/CommonStyles";
import BootstrapTable from "react-bootstrap-table-next";
import Button from "react-bootstrap/Button";

function ShoppingCart(props) {

  const [isStale, setIsStale] = useState(true);
  const [totalSum, setTotalSum] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Confirmed");
  const [paymentMethod, setPaymentMethod] = useState("Cash-On-Delivery");
  const [addressForDelivery, setAddressForDelivery] = useState("")
  const columns = [
    {
      dataField: 'image',
      text: 'Image',
      formatter: imageFormatter,
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
    },
    {
      dataField: 'title',
      text: 'Product Title',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},

    }, {
      dataField: 'price',
      text: 'Product Price',
      align: 'center',
      headerAlign: 'center',
      formatter: currencyFormatter,
      headerStyle: {color: 'orange'},
    }, {
      dataField: 'quantity',
      text: 'Quantity',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
      formatter: inventoryFormatter,
    }, {
      dataField: 'totalSum',
      text: 'Total',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center',
      formatter: currencyFormatter,
    }, {
      dataField: '',
      text: '',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center',
      formatter: removeItemFormatter,
      hidden: checkout,
    }];

  useEffect(async () => {
    if (isStale) {
      let url = `${serverURL}/shoppingCartProducts?userID=${encodeURIComponent(props.userID)}`;
      await fetch(url).then(response => response.json()).then(async (data) => {
        if (!isEmpty(data) && isEmpty(data.error)) {
          setProducts(data);
          url = `${serverURL}/shoppingCartTotal?userID=${encodeURIComponent(props.userID)}`;
          await fetch(url).then(response => response.json()).then((data) => {
            setTotalSum(data.totalSum);
          }).catch((error) => {
            console.log(error);
            alert(error + "\nLooks like the server is down, please try after sometime.");
          });
        } else {
          setTotalSum(0);
        }
      }).catch((error) => {
        console.log(error);
        alert(error + "\nLooks like the server is down, please try after sometime.");
      });
      setIsStale(false);
    }
  }, [isStale])

  function currencyFormatter(cell, row) {
    return (
      <div style={{alignItems: 'center'}}>
        {cell + ' $'}
      </div>
    );
  }

  function imageFormatter(cell, row) {
    return (
      <img style={{height: 100, width: 100}} src={`data:image/png;base64,${cell}`}/>
    );
  }

  function inventoryFormatter(cell, row) {
    return (
      <div style={{alignItems: 'center'}}>
        {!checkout && <input type={"text"} onChange={(event) => updateCartQuantity(event.target.value, row)}
                             value={row.quantity}
                             style={{textAlign: "center", border: 1, width: "100%", justifyContent: 'center'}}
                             readOnly={checkout}/>}
        {checkout && <div>{row.quantity}</div>}
      </div>
    );
  }

  function removeItemFormatter(cell, row) {
    return (
      <div style={{alignItems: 'center'}}>
        <CloseButton onClick={() => deleteCartItem(row)}/>
      </div>
    );
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

  const deleteCartItem = async (item) => {
    setProducts([])
    let url = `${serverURL}/shoppingCart?scID=${encodeURIComponent(item.scID)}`;
    const requestOptionsForCartDelete = {
      method: "DELETE",
    };
    await fetch(url, requestOptionsForCartDelete).then(response => response.json()).then((data) => {
      // alert("cart item deleted successfully");
      setIsStale(true);
    }).catch((error) => {
      console.log(error);
    });
  }

  const deleteAllCartItems = async () => {
    setProducts([])
    let url = `${serverURL}/allShoppingCart?userID=${encodeURIComponent(props.userID)}`;
    const requestOptionsForCartDelete = {
      method: "DELETE",
    };
    await fetch(url, requestOptionsForCartDelete).then(response => response.json()).then((data) => {
      if (!isEmpty(data.error)) return false;
    }).catch((error) => {
      console.log(error);
    });
  }

  const getUserAddress = async () => {
    let url = `${serverURL}/address?userID=${encodeURIComponent(props.userID)}&status='PRIMARY'`;
    await fetch(url).then(response => response.json()).then((data) => {
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

  const placeOrder = async () => {
    if (window.confirm("Orders once placed cannot be cancelled. Are you sure you want to continue ?")) {
      let currTime = Date.now();
      let orderID = props.userID + currTime;
      let orderList = buildOrderList(orderID);
      let orderData = await updateOrder(orderList);
      await updateTransaction(orderID);
      alert(
        "Transaction successful, Please see Order history for order details with order ID : " + orderID);
      await updateInventory();
      await deleteAllCartItems();
      setIsStale(true);
      props.closeCart();
    }
    else return;
  }

  const updateCartQuantity = async (quantity, item) => {
    setProducts([])
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
      if (!isEmpty(data.error)) return false;
      //alert("Cart Quantity updated to" + data.quantity)
      setIsStale(true);
    }).catch((error) => {
      console.log(error);
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  const updateInventory = async () => {
    setProducts([])
    let url = `${serverURL}/inventoryUpdate?userID=${encodeURIComponent(props.userID)}`;
    const requestOptions = {
      method: "PUT",
    };
    await fetch(url, requestOptions).then(response => response.json()).then((data) => {
      if (!isEmpty(data.error)) return false;
    }).catch((error) => {
      console.log(error);
    });
  }

  const updateOrder = async (orderList) => {
    if (!isEmpty(orderList)) {
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          orders: orderList,
          userID: props.userID
        })
      };
      await fetch(`${serverURL}/order`, requestOptions)
        .then(response => response.json())
        .then((data) => {
          if (isEmpty(data.error)) return data;
          else {
            alert(data.error);
            return {};
          }
        }).catch((error) => {
          console.log(error)
          alert(error);
        });
    }
    return {};
  }

  const updateTransaction = async (orderID) => {
    if (isEmpty(orderID)) return {}
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        orderID: orderID,
        userID: props.userID,
        paymentMethod: paymentMethod,
        status: status,
        address: addressForDelivery,
        totalAmount: totalSum,
        dateOfTransaction: Date.now().toString(),
      })
    };
    await fetch(`${serverURL}/transactions`, requestOptions)
      .then(response => response.json())
      .then(async (data) => {
        return data;
      }).catch(error => {
        console.log(error)
        alert(error)
      })
  }

  return (
    <Modal show={true} onHide={() => props.closeCart()} size="xl">
      <Modal.Header>
        {!checkout && <Modal.Title>Shopping Cart</Modal.Title>}
        {checkout && <Modal.Title>Final Checkout</Modal.Title>}
        <CloseButton onClick={() => {
          props.closeCart();
        }}/>
      </Modal.Header>
      <Modal.Body>
        {checkout && (
          <BootstrapTable striped hover condensed keyField='id'
                          data={products} columns={columns}
                          rowStyle={rowStyle} noDataIndication="Shopping cart is Empty"/>
        )}
        {!checkout && (
          <BootstrapTable striped hover condensed keyField='id'
                          data={products} columns={columns}
                          rowStyle={rowStyle} noDataIndication="Shopping cart is Empty"/>
        )}
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
              <div className="col-md-6" style={{paddingTop:5}}>
                <div>
                  <label>Delivery Address:</label>
                </div>
                <div>
                  <textarea rows={6} placeholder={"Address for delivery"} type="text" value={addressForDelivery}
                        onChange={(event) => setAddressForDelivery(event.target.value)} required={true}
                        readOnly={false}/>
                </div>
              </div>
              <div className={"col-md-6"} style={{paddingLeft: 30}}>
                <Button onClick={async (e) => {
                  e.preventDefault();
                  await getUserAddress();
                }} disabled={totalSum == 0} variant="outline-info">Autofill your address</Button>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div>
          <label className="mr-sm-2">Total Sum:</label>
          <input type="text" value={totalSum + "$"}
                 style={{textAlign: "left", border: 0}} readOnly={true}/>
          {!checkout && <Button onClick={() => setCheckout(true)} disabled={totalSum == 0}
                                variant="outline-info">Checkout</Button>}
          {checkout && <Button className="mr-sm-2" onClick={async (e) => setCheckout(false)}
                               variant="outline-info"> Cancel </Button>}
          {checkout &&
          <Button onClick={async (e) => {
            e.preventDefault();
            await placeOrder();
          }} disabled={totalSum == 0} variant="outline-info">Place Order</Button>}
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default ShoppingCart;