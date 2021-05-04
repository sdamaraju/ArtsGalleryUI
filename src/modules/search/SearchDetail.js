import React, {useEffect, useState} from 'react';
import Table from "react-bootstrap/Table";
import UserProfileStyles from "../styles/CommonStyles";
import CommonStyles from "../styles/CommonStyles";
import Button from "react-bootstrap/Button";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";

function SearchDetail(props) {
  const [searchData, setSearchData] = useState(props.searchData);
  const [priceMaximum, setPriceMaximum] = useState(isEmpty(searchData) ? 0 : searchData.priceMaximum);
  const [priceMinimum, setPriceMinimum] = useState(isEmpty(searchData) ? 0 : searchData.priceMinimum);
  const [title, setTitle] = useState(isEmpty(searchData) ? "" : searchData.title);
  const [description, setDescription] = useState(isEmpty(searchData) ? "" : searchData.description);
  const [category, setCategory] = useState(isEmpty(searchData) ? "" : searchData.category);
  const [artist, setArtist] = useState(isEmpty(searchData) ? "" : searchData.artist);
  const [sortPriceHighToLow, setSortPriceHighToLow] = useState(isEmpty(searchData) ? false : searchData.sortPriceHighToLow);
  const [sortPriceLowToHigh, setSortPriceLowToHigh] = useState(isEmpty(searchData) ? false : searchData.sortPriceLowToHigh);
  const [availableArtists, setAvailableArtists] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [stale, setStale] = useState(true);

  useEffect(async () => {
    if (stale) {
      await getDistinctArtists();
      await getDistinctCategories();
      setStale(false);
    }
  })

  const buildSearchData = () => {
    let searchData = JSON.parse(JSON.stringify({
      priceMinimum: priceMinimum,
      priceMaximum: priceMaximum,
      title: title,
      description: description,
      artist: artist,
      category: category,
      sortPriceLowToHigh:sortPriceLowToHigh,
      sortPriceHighToLow:sortPriceHighToLow,
    }))
    setSearchData(searchData);
    return searchData;
  }

  const clearSearch = () => {
    setPriceMinimum(0);
    setPriceMaximum(0);
    setArtist("");
    setCategory("");
    setTitle("");
    setDescription("");
    setSortPriceLowToHigh(false);
    setSortPriceHighToLow(false);
    props.customSearch(false);
  }

  const getDistinctArtists = async () => {
    fetch(`${serverURL}/allArtists`)
      .then(response => response.json())
      .then(data => {
        //alert("Profile updated successfully.");
        setAvailableArtists(data);
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }

  const getDistinctCategories = async () => {
    fetch(`${serverURL}/allCategories`)
      .then(response => response.json())
      .then(data => {
        //alert("Profile updated successfully.");
        setAvailableCategories(data);
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }

  const search = async ()=> {
    //transformPrices();
    let searchData = buildSearchData();
    props.setSearchData(searchData);
    props.customSearch(true);
    props.searchDetail(searchData);
  }

  const transformPrices = () => {
    console.log(priceMaximum, priceMinimum)
    if (priceMaximum < priceMinimum) {
      let temp = priceMinimum
      setPriceMinimum(priceMaximum)
      setPriceMaximum(temp);
    }
    return;
  }

  return (
    <div>
      {/*<div>
        <img style={{height: 300, width: "80%", paddingLeft: 13, paddingTop: 10}} src={tagCloud}/>
      </div>*/}
      <div style={{paddingTop: 20}}>
        <h2 style={{fontFamily: 'cursive', color: "black", fontSize: 40}}> Filter and find your choice..</h2>
        <Table striped hover>
          <tbody>
          <tr>
            <td style={CommonStyles.searchField}>Price Minimum $</td>
            <td><input type="number" value={priceMinimum}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => {
                         setPriceMinimum(event.target.value)
                       }}/></td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Price Maximum $</td>
            <td><input type="number" value={priceMaximum}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => {
                         setPriceMaximum(event.target.value)
                       }}/></td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Title</td>
            <td><input placeholder={"you may provide any title.."} type="text" value={title}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => {
                         setTitle(event.target.value)
                       }}/></td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Description</td>
            <td><input placeholder={"you may provide any description.."} type="text" value={description}
                       style={UserProfileStyles.textBoxComp}
                       onChange={(event) => {
                         setDescription(event.target.value)
                       }}/></td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Category</td>
            <td><Dropdown options={availableCategories} onChange={(evt) => {
              setCategory(evt.value)
            }} value={category}  placeholder="Select a category"/></td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Artist</td>
            <td>
              <Dropdown options={availableArtists} onChange={(evt) => {
                setArtist(evt.value)
              }} value={artist} placeholder="Select an artist"/>
            </td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Sort Prices Low to High</td>
            <td><input type="checkbox"
                       checked={sortPriceLowToHigh}
                       onClick={(event) => {
                         setSortPriceLowToHigh(!sortPriceLowToHigh);
                       }} style={UserProfileStyles.checkBoxComp} disabled={sortPriceHighToLow}/>
            </td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}>Sort Prices High to Low</td>
            <td><input type="checkbox"
                       checked={sortPriceHighToLow}
                       onClick={(event) => {
                         setSortPriceHighToLow(!sortPriceHighToLow)
                       }} style={UserProfileStyles.checkBoxComp} disabled={sortPriceLowToHigh}/>
            </td>
          </tr>
          <tr>
            <td style={CommonStyles.searchField}><Button variant="info" onClick={() => {
              clearSearch()
            }}>Clear Search</Button></td>
            <td style={CommonStyles.searchField}><Button variant="success" onClick={() => {
              search()
            }}>Find your heart here..</Button></td>
          </tr>
          </tbody>
        </Table>
      </div>
    </div>

  );
}

export default SearchDetail;