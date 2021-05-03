import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../styles/box.css"
import SearchDetail from "../search/SearchDetail";
import CommonStyles from "../styles/CommonStyles";
import UserProfileStyles from "../styles/CommonStyles";
import Table from "react-bootstrap/Table";

function AllProducts(props) {
  const [products, setProducts] = useState([]);
  const [searchEnabled, setSearchEnabled] = useState(props.searchEnabled);
  const [stringSearchCriteria, setStringSearchCriteria] = useState(props.filterCriteria);
  const [customSearch, setCustomSearch] = useState(false);
  const [overAllRatings, setOverAllRatings] = useState([]);

  useEffect(async () => {
    if (!customSearch) {
      if (!searchEnabled || (searchEnabled && isEmpty(stringSearchCriteria))) {
        await getAllProducts();
      }
      else if (searchEnabled && !isEmpty(stringSearchCriteria)) await searchProductsByString(stringSearchCriteria);
    }
  }, [customSearch]);

  const getAllProducts = async () => {
    await fetch(`${serverURL}/products?userID=${encodeURIComponent(234234)}`)
      .then(response => response.json())
      .then(async data => {
        if (!data.error) {
          setProducts(data);
          await getOverAllRatingForProducts(data);
        }
        else {
          alert("All available products are in your shopping cart, please review cart and proceed to checkout.")
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  const getOverAllRatingForProducts = async (products) => {
    await fetch(`${serverURL}/ratingPerProduct`)
      .then(response => response.json())
      .then(async (data) => {
        let ratings = [];
        products.map(product => {
          let productRating = data.filter(eachRating => product.productID === eachRating.productID)
          isEmpty(productRating) ? ratings.push(0) : ratings.push(productRating[0].overAllRating);
        })
        setOverAllRatings(ratings);
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }


  const runSearchDetail = async (searchData) => {
    //let url = `${serverURL}/productsDetailSearch?priceMinimum=${searchData.priceMinimum}&priceMaximum=${searchData.priceMaximum}&artist=${isEmpty(searchData.artist) ? "EMPTY" : searchData.artist}&description=${isEmpty(searchData.description) ? "EMPTY" : searchData.description}&title=${isEmpty(searchData.title) ? "EMPTY" : searchData.title}&category=${isEmpty(searchData.category) ? "EMPTY" : searchData.category}&sortPriceHighToLow=${searchData.sortPriceHighToLow}&sortPriceLowToHigh=${searchData.sortPriceLowToHigh}`;
    let url = `${serverURL}/productsDetailSearch?priceMinimum=${searchData.priceMinimum < 0 ? 0 : searchData.priceMinimum}&priceMaximum=${searchData.priceMaximum <= 0 ? 1000000000 : searchData.priceMaximum}&artist=${searchData.artist}&description=${searchData.description}&title=${searchData.title}&category=${searchData.category}&sortPriceHighToLow=${searchData.sortPriceHighToLow}&sortPriceLowToHigh=${searchData.sortPriceLowToHigh}`;
    console.log(url);
    await fetch(url)
      .then(response => response.json())
      .then(async (data) => {
        if (!data.error) {
          setProducts(data);
          await getOverAllRatingForProducts(data);
        }
        else {
          await getAllProducts();
          alert("No results found, please refine your search")
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  const searchProductsByString = async (stringSearchCriteria) => {
    setProducts([]);
    await fetch(`${serverURL}/productsSearchString?searchString=${encodeURIComponent(stringSearchCriteria)}`)
      .then(response => response.json())
      .then(async (data) => {
        if (data.error) {
          await getAllProducts();
          alert("Search did not return results, please refine your search criteria")
        }
        else {
          setProducts(data);
          await getOverAllRatingForProducts(data);
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  const renderProduct = (product, index) => {
    console.log(overAllRatings)
    return (
      <Card style={{width: '18rem'}} className="box box1">
        <Card.Img onClick={() => props.openProductDetail(product)} style={{height: 300}} variant="top"
                  src={`data:image / png;base64,${product.image}`}/>
        <Card.Body>
          <Table striped >
            <tbody>
            <tr>
              <td style={CommonStyles.prodDisplayField}>Title</td>
              <td><Card.Title style={CommonStyles.prodDisplayFieldData}>{product.title}</Card.Title></td>
            </tr>
            <tr>
              <td style={CommonStyles.prodDisplayField}>Rating</td>
              <td>{overAllRatings[index] > 0 && <Card.Text style={CommonStyles.prodDisplayFieldData}>{overAllRatings[index] + "/5"}</Card.Text>}</td>
            </tr>
            <tr>
              <td style={CommonStyles.prodDisplayField}>Description</td>
              <td>{product.description && (<Card.Text style={{display:"flex",justifyContent:"Center",fontFamily: "serif", color: "#459c5d", fontSize: 20}}>
                {product.description.length > 100 ? product.description.substr(0, 75)+"..." : product.description}
              </Card.Text>)}</td>
            </tr>
            <tr>
              <td style={CommonStyles.prodDisplayField}>Category</td>
              <td><Card.Text style={CommonStyles.prodDisplayFieldData}>{product.category}</Card.Text></td>
            </tr>
            <tr>
              <td style={CommonStyles.prodDisplayField}>Price</td>
              <td><Card.Text style={CommonStyles.prodDisplayFieldData}>{product.price + ' $'}</Card.Text></td>
            </tr>
            </tbody>
          </Table>
          <Button onClick={() => {
            props.openProductDetail(product)
          }} variant="outline-info">Add to cart</Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {!isEmpty(products) && (
        <div>
          {searchEnabled && <div className="row">
            <div className="col" >
              <SearchDetail searchDetail={async (searchData) => await runSearchDetail(searchData)}
                            customSearch={(value) => {
                              setCustomSearch(value)
                            }}/>
            </div>
            <div className="col-md-8" style={{marginRight: 30}}>
              <div className="grid">{products.map((product, index) => renderProduct(product, index))}</div>
            </div>
          </div>}
          {!searchEnabled &&
          <div className="grid" style={{margin: 30}}>{products.map(
            (product, index) => renderProduct(product, index))}</div>}
        </div>
      )}
      {isEmpty(products) && <h2>No Products Found</h2>}
    </div>
  );
}

export default AllProducts;
