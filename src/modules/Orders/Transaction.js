import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty, rowStyle} from "../utils/util";
import OrderDetails from "./OrderDetail";
import BootstrapTable from "react-bootstrap-table-next";

function Transactions(props) {

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetail, setOrderDetail] = useState(false);
  const [transactions, setTransactions] = useState(false);
  const columns = [
    {
      dataField: 'dateOfTransaction',
      text: 'Order Date',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
      formatter: dateFormatter,
    }, {
      dataField: 'orderID',
      text: 'Order ID',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
    }, {
      dataField: 'address',
      text: 'Delivery Address',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
    }, {
      dataField: 'totalAmount',
      text: 'Total Amount',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center'
    }, {
      dataField: 'paymentMethod',
      text: 'Payment Method',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center'
    }, {
      dataField: 'status',
      text: 'Order Status',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center'
    }, {
      dataField: 'deliveryDate',
      text: 'Delivery Date',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center'
    }

  ];
  const rowEvents = {
    onClick: (event, order, rowIndex) => {
      openOrder(order);
    }
  };

  useEffect(async () => {
    await getTransactions();
  }, []);

  function dateFormatter(cell, row) {
    return (
      <div>{new Date(cell).toDateString()}</div>
    );
  }

  const openOrder = (order) => {
    setShowOrderDetails(true);
    setOrderDetail(order);
  }

  const getTransactions = async () => {
    let url = `${serverURL}/transactions?userID=${encodeURIComponent(props.userID)}`;
    await fetch(url).then(response => response.json()).then((data) => {
      if (!isEmpty(data.error)) return;
      setTransactions(data);
    }).catch((error) => {
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  return (
    <Modal show={true} onHide={() => props.closeTransactions()} size="xl">
      <Modal.Header>
        <Modal.Title>Order History</Modal.Title>
        <CloseButton onClick={() => {
          props.closeTransactions();
        }}/>
      </Modal.Header>
      <Modal.Body>
        {!showOrderDetails && !isEmpty(transactions) && (
          <BootstrapTable striped hover condensed keyField='id'
                          data={transactions} columns={columns}
                          rowStyle={rowStyle} rowEvents={rowEvents}/>
        )}
        {showOrderDetails && (
          <OrderDetails orderID={orderDetail.orderID} closeOrderDetails={() => {
            setShowOrderDetails(false)
            setOrderDetail(null);
          }}/>
        )}
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
    </Modal>

  );

}

export default Transactions;