import React, {useEffect, useState} from "react";
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../styles/box.css"
import SearchDetail from "../search/SearchDetail";

function AllProducts(props) {
  const [products, setProducts] = useState([]);
  const [searchEnabled, setSearchEnabled] = useState(props.searchEnabled);
  const [stringSearchCriteria, setStringSearchCriteria] = useState(props.filterCriteria);
  const [customSearch, setCustomSearch] = useState(false);

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
      .then(data => {
        if (!data.error) {
          setProducts(data);
        } else {
          alert("All available products are in your shopping cart, please review cart and proceed to checkout.")
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  const runSearchDetail = async (searchData) => {
    //let url = `${serverURL}/productsDetailSearch?priceMinimum=${searchData.priceMinimum}&priceMaximum=${searchData.priceMaximum}&artist=${isEmpty(searchData.artist) ? "EMPTY" : searchData.artist}&description=${isEmpty(searchData.description) ? "EMPTY" : searchData.description}&title=${isEmpty(searchData.title) ? "EMPTY" : searchData.title}&category=${isEmpty(searchData.category) ? "EMPTY" : searchData.category}&sortPriceHighToLow=${searchData.sortPriceHighToLow}&sortPriceLowToHigh=${searchData.sortPriceLowToHigh}`;
    let url = `${serverURL}/productsDetailSearch?priceMinimum=${searchData.priceMinimum < 0 ? 0 : searchData.priceMinimum}&priceMaximum=${searchData.priceMaximum <= 0 ? 100000 : searchData.priceMaximum}&artist=${searchData.artist}&description=${searchData.description}&title=${searchData.title}&category=${searchData.category}&sortPriceHighToLow=${searchData.sortPriceHighToLow}&sortPriceLowToHigh=${searchData.sortPriceLowToHigh}`;
    console.log(url);
    await fetch(url)
      .then(response => response.json())
      .then(async(data) => {
        if (!data.error) {
          setProducts(data);
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
      .then(async(data) => {
        if (data.error) {
          await getAllProducts();
          alert("Search did not return results, please refine your search criteria")
        }else {
          setProducts(data);
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  const renderProduct = (product) => {
    return (
      <Card style={{width: '18rem'}} className="box box1">
        <Card.Img onClick={() => props.openProductDetail(product)} style={{height: 300}} variant="top"
                  src={`data
:
image / png;
base64,${product.image}`}/>
        <Card.Body>
          <Card.Title>{product.title}</Card.Title>
          {product.description && (
            <Card.Text>
              {product.description.length > 100 ? product.description.substr(0, 75) : product.description}
            </Card.Text>
          )}
          <Card.Text>
            {product.category}
          </Card.Text>
          <Card.Text>
            {product.price + ' $'}
          </Card.Text>
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
            <div className="col" style={{backgroundColor: 'grey'}}>
              <SearchDetail searchDetail={async (searchData) => await runSearchDetail(searchData)}
                            customSearch={(value) => {
                              setCustomSearch(value)
                            }}/>
            </div>
            <div className="col-md-8" style={{marginRight: 30}}>
              <div className="grid">{products.map((product) => renderProduct(product))}</div>
            </div>
          </div>}
          {!searchEnabled &&
          <div className="grid" style={{margin: 30}}>{products.map((product) => renderProduct(product))}</div>}
        </div>
      )}
      {isEmpty(products) && <h2>No Products Found</h2>}
    </div>
  );
}

export default AllProducts;
