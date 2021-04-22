import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";

function AllProducts(props) {
  const [data, setData] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(async () => {
    if (isEmpty(data)) {
      await fetch(`${serverURL}/products`)
        .then(response => response.json())
        .then(data => {
          if (!data.error) {
            setData(data);
            createItemList(data);
          }
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });
    }
  }, []);

  const createItemList = (data) => {
    setRows([]);
    let counter = 1
    data.forEach((item, idx) => {
      rows[counter] = rows[counter] ? [...rows[counter]] : []
      if (idx % 4 === 0 && idx !== 0) {
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

  const renderItem = (item) => {
    return (
      <div style={{padding: 10}} className={"col"}>
        <div className="row" style={{justifyContent: "center"}}><img onClick={() => {
          props.openProductDetail(item)
        }} style={{height: 260, width: 240, paddingBottom: 10}}
                                                                     src={`data:image/png;base64,${item.image}`}/></div>
        <div className="row" style={{justifyContent: "center"}}>{item.title}</div>
        {/*<div className="row" style={{justifyContent: "center"}}>Description : {item.description}</div>*/}
        <div className="row" style={{justifyContent: "center"}}>{item.price + ' $'}</div>
        <div className="row" style={{justifyContent: "center"}}>{item.category}</div>
      </div>
    );
  }

  return (
    <section className="section items">
      {!isEmpty(rows) && <div style={{backgroundColor: "white"}} className="container">
        {Object.keys(rows).map(row => {
          return (
            <div className="row" key={row} style={{padding: 10, alignItems: 'center'}}>
              {rows[row].map(item => {
                return (
                  renderItem(item)
                )
              })}
            </div>
          );
        })
        }
      </div>}
    </section>
  );
}

export default AllProducts;
