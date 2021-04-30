import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty, rowStyle} from "../utils/util";
import BootstrapTable from 'react-bootstrap-table-next';

function OrderDetails(props) {

  const [transaction, setTransaction] = useState(null);
  const [products, setProducts] = useState([]);
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
      headerStyle: {color: 'orange'},
    }, {
      dataField: 'quantity',
      text: 'Quantity',
      align: 'center',
      headerAlign: 'center',
      headerStyle: {color: 'orange'},
    }, {
      dataField: 'totalAmount',
      text: 'Paid',
      headerStyle: {color: 'orange'},
      align: 'center',
      headerAlign: 'center'

    },];

  useEffect(async () => {
    await getOrderProducts();
  }, []);

  const getOrderProducts = async () => {
    let url = `${serverURL}/orders?orderID=${encodeURIComponent(props.orderID)}`;
    await fetch(url).then(response => response.json()).then((data) => {
      if (isEmpty(data.error) && !isEmpty(data)) {
        data.map(eachRecord => {
          eachRecord.prd.quantity = eachRecord.quantity;
          eachRecord.prd.totalAmount = eachRecord.quantity * eachRecord.prd.price;
          products.push(eachRecord.prd)
        });
        setTransaction(data[0].trx);
        setProducts(products)
      }
      else {
        alert("Order details not available.")
      }
    }).catch((error) => {
      console.log(error);
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  function imageFormatter(cell, row) {
    return (
      <img style={{height: 100, width: 100}} src={`data:image/png;base64,${cell}`}/>
    );
  }

  return (
    <Modal show={true} onHide={() => props.closeOrderDetails()} size="xl">
      <Modal.Header>
        <Modal.Title>Order Details</Modal.Title>
        <CloseButton onClick={() => {
          props.closeOrderDetails();
        }}/>
      </Modal.Header>
      <Modal.Body>
        {!isEmpty(products) &&
        <BootstrapTable striped hover condensed keyField='id' data={products} columns={columns} rowStyle={rowStyle}/>}
      </Modal.Body>
      <Modal.Footer>
        {transaction && (
          <div>
            <label className="mr-sm-2">Total Sum:</label>
            {transaction.totalAmount + ' $'}
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );

}

export default OrderDetails;