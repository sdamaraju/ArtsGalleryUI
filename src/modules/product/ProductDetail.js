import UserProfileStyles from "../styles/CommonStyles";
import CloseButton from "react-bootstrap/CloseButton";
import React, {useEffect, useState} from "react";
import {isEmpty} from "../utils/util";
import insertImage from "../../assets/images/insertImage.png"
import {serverURL} from "../../app.constants";
import {productCategories} from "../../app.constants";
import Modal from "react-bootstrap/Modal";


function ProductDetail(props) {
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isEditable, setIsEditable] = useState(props.isEditable);
  const [prodData, setProdData] = useState(null);
  const [title, setTitle] = useState(!isEmpty(prodData) ? prodData.title : "");
  const [description, setDescription] = useState(!isEmpty(prodData) ? prodData.description : "");
  const [price, setPrice] = useState(!isEmpty(prodData) ? prodData.price : "");
  const ownerID = props.userId;
  const [image, setImage] = useState(!isEmpty(prodData) ? prodData.image : "");
  const [category, setCategory] = useState(!isEmpty(prodData) ? prodData.category : "");
  const [productID, setProductID] = useState(!isEmpty(prodData) ? prodData.productID : "")
  const [changeImage, setChangeImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [inventory, setInventory] = useState(1);
  const [isStale, setIsStale] = useState(true);
  let categoriesList = productCategories.map((item, i) => {
    return (
      <option key={i} value={item}>{item}</option>
    )
  });

  const getInventory = async () => {
    if (isEmpty(productID) && isEmpty(props.product)) {
      return;
    }
    await fetch(
      `${serverURL}/inventory?productID=${encodeURIComponent(productID ? productID : props.product.productID)}`)
      .then(response => response.json())
      .then(data => {
        /*alert("Product inventory updated successfully."+data.availableCount);*/
        setInventory(data.availableCount);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  useEffect(async () => {
    if (!isEmpty(props.product)) {
      if (props.product.ownerID == props.userId) setIsEditEnabled(true);
      else setIsEditEnabled(false);
      if (!isStale) {
        setProdData(props.product);
      }
      else {
        let url = `${serverURL}/product?productID=${encodeURIComponent(props.product.productID)}`
        await fetch(url).then(response => response.json()).then((data) => {
          setProdData(data);
        }).catch((error) => {
          console.log(error);
          alert(error + "\nLooks like the server is down, please try after sometime.");
        });
        setIsStale(false);
      }
    } else {
      setIsEditEnabled(true);
    }
    if (!props.isNew) await getInventory();
    if (isEmpty(ownerName)) {
      let url = `${serverURL}/userName?userID=${encodeURIComponent(props.product ? props.product.ownerID : ownerID)}`
      await fetch(url).then(response => response.json()).then((data) => {
        if (isEmpty(data.error)) {
          setOwnerName(data.userName);
        }
        else {
          setOwnerName("N-A");
        }
      }).catch((error) => {
        console.log(error);
        alert(error + "\nLooks like the server is down, please try after sometime.");
      });
    }
  }, []);


  useEffect(async () => {
    if (!isEmpty(prodData)) {
      setTitle(prodData.title);
      setDescription(prodData.description);
      setPrice(prodData.price);
      setProductID(prodData.productID);
      setCategory(prodData.category);
      setImage(prodData.image);
    }
  }, [prodData]);

  const updateInventory = async (method, prodForInventory) => {
    const requestOptions = {
      method: method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        productID: prodForInventory.productID,
        availableCount: inventory,
      })
    };
    await fetch(`${serverURL}/inventory`, requestOptions)
      .then(response => response.json())
      .then(data => {
        /*alert("Product updated successfully."+data.availableCount);*/
        setInventory(data.availableCount);
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }

  async function saveProduct(method) {
    const requestOptions = {
      method: method,
      headers: {'Content-Type': 'application/json'},
      body: method == "POST" ? JSON.stringify({
        title: title,
        price: price,
        description: description,
        ownerID: props.userId,
        category: category == "" ? productCategories[0] : category,
      }) : JSON.stringify({
        productID: productID,
        title: title,
        price: price,
        description: description,
        ownerID: props.userId,
        category: category == "" ? productCategories[0] : category,
      })
    };
    let prodForInventory;
    await fetch(`${serverURL}/product`, requestOptions)
      .then(response => response.json())
      .then(data => {
        //alert("Product updated successfully.");
        setProdData(data);
        prodForInventory = data;
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
    await updateInventory(method, prodForInventory);
    setIsEditable(false);
    setChangeImage(false);
    setIsStale(true);
  }

  async function uploadProductImage() {
    var formData = new FormData();
    formData.append('productID', productID);
    formData.append('image', selectedFile);
    fetch(`${serverURL}/productImage`, {
      method: 'PUT',
      body: formData
    }).then(resp => resp.json()).then((data) => {
      if (!isEmpty(data.error)) {
        alert(data.error + "\nLooks like there is an issue with the image, image not updated");
        setChangeImage(false);
      }
      else {
        setImage(data.image);
        /*let strings = data.photo.split(",");
        let extension;
        switch (strings[0]) {//check image's extension
          case "data:image/jpeg;base64":
            extension = "jpeg";
            break;
          case "data:image/png;base64":
            extension = "png";
            break;
          default://should write cases for more images types
            extension = "jpg";
            break;
        }
        setPhotoType(extension);*/
        setChangeImage(false);
        setSelectedFile(null);
        //alert(data.userName + "'s profile image updated.");
      }
    }).catch((error) => {
      alert(error + "\nLooks like the server is down, please try after sometime.");
    });
  }

  async function addToCart() {
    console.log(productID, quantity, props.userId)
    const requestOptionsForCart = {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        productID: productID,
        quantity: quantity,
        userID: props.userId
      })
    };
    console.log(requestOptionsForCart.body)
    await fetch(`${serverURL}/shoppingCart`, requestOptionsForCart)
      .then(response => response.json())
      .then(data => {
        alert("Added to cart successfully.");
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
    props.closeDetail();
  }

  async function deleteProduct() {
    const requestOptions = {
      method: "DELETE",
    };
    await fetch(`${serverURL}/inventory?productID=${encodeURIComponent(productID)}`, requestOptions)
      .catch((error) => {
        alert(error);
      });
    await fetch(`${serverURL}/product?productID=${encodeURIComponent(productID)}`, requestOptions)
      .catch((error) => {
        alert(error);
      });
    props.closeDetail();
  }

  return (
    <Modal show={true} onHide={() => props.closeDetail()} size="lg">
      <Modal.Header>
        {props.isNew && <Modal.Title>Add a Product</Modal.Title>}
        {!props.isNew && <Modal.Title>Selected Product</Modal.Title>}
        <CloseButton onClick={() => {
          setIsEditable(false);
          props.closeDetail();
        }}/>
      </Modal.Header>
      <Modal.Body>
        <div style={{backgroundColor: "white", opacity: 1}}>
          <form method="post">
            <div className="row" style={{paddingTop: 10}}>
              <div className="col-md-6">
                <div className="profile-img">
                  {isEmpty(image) &&
                  <img style={{height: 180, width: 200, paddingBottom: 10}} src={insertImage}/>}
                  {!isEmpty(image) &&
                  <img style={{height: 300, width: 300, paddingBottom: 10}} src={`data:image/png;base64,${image}`}/>}
                  {isEditEnabled && <div style={{paddingBottom: 5}}>
                    <button type="button" onClick={() => setChangeImage(true)} className="btn btn-secondary">
                      {isEmpty(image) ? "Add Image" : "Change Image"}
                    </button>
                  </div>}
                  {changeImage &&
                  <div>
                    <div className="row-cols-2">
                      <input type="file" onChange={(event) => {
                        setSelectedFile(event.target.files[0])
                      }}/>
                      <button type="button" onClick={() => {
                        setChangeImage(false);
                        setSelectedFile(null)
                      }} className="btn btn-secondary">Cancel
                      </button>
                    </div>
                    {selectedFile && <button type="button" onClick={async (e) => {
                      e.preventDefault();
                      await uploadProductImage();
                    }} className="btn btn-primary">Upload
                    </button>}
                  </div>
                  }
                </div>
              </div>
              <div className="col-md-4" style={{alignItems: "right"}}>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Title</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Product title"} type="text" value={title}
                           style={UserProfileStyles.textBoxComp}
                           onChange={(event) => setTitle(event.target.value)} required={true} readOnly={!isEditable}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Description</label>
                  </div>
                  <div className="col-md-6">
                    <textarea rows={4} placeholder={"Description"} type="text" value={description}

                              onChange={(event) => setDescription(event.target.value)} required={true}
                              readOnly={!isEditable}/>
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Price</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Price"} type="text" value={price}
                           style={UserProfileStyles.textBoxComp}
                           onChange={(event) => setPrice(event.target.value)} required={true} readOnly={!isEditable}/>
                  </div>
                </div>
                {!isEditable && <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Owner</label>
                  </div>
                  <div className="col-md-6">
                    <input placeholder={"Owner"} type="text" value={ownerName}
                           style={UserProfileStyles.textBoxComp}
                           required={true} readOnly={true}/>
                  </div>
                </div>}
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Category</label>
                  </div>
                  <div className="col-md-6">
                    {isEditable &&
                    <select style={UserProfileStyles.textBoxComp} onChange={(event) => setCategory(event.target.value)}
                            required={true} readOnly={!isEditable}> {categoriesList}</select>}
                    {!isEditable &&
                    <input type="text" value={category} style={UserProfileStyles.textBoxComp} readOnly={true}/>}
                  </div>
                </div>
                <div className="row" style={{padding: 5}}>
                  <div className="col-md-6">
                    <label>Available#</label>
                  </div>
                  <div className="col-md-6">
                    <input style={UserProfileStyles.textBoxComp} onChange={(event) => setInventory(event.target.value)}
                           value={inventory} required={true} readOnly={!isEditable}/>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>

      <Modal.Footer>
        {isEditEnabled && !props.isNew && <div className={"text-start"}>
          <input type="submit" onClick={async (event) => {
            event.preventDefault()
            await deleteProduct()
          }}
                 className="btn-warning" name="btnAddMore"
                 value="Delete Product"/>
        </div>}
        {isEditEnabled && <div>
          {!isEditable &&
          <input type="submit" onClick={() => setIsEditable(true)} className="profile-edit-btn" name="btnAddMore"
                 value="Edit Product"/>}
          {
            isEditable &&
            <input type="submit" onClick={async (event) => {
              event.preventDefault()
              if (props.isNew && isEmpty(productID)) {
                await saveProduct("POST");
              }
              else await saveProduct("PUT");
            }} className="profile-edit-btn" name="btnAddMore"
                   value="Save Product"/>
          }
        </div>}
        {!props.isNew && (
          <div>
            <label className="mr-sm-2">Quantity:</label>
            <input className="mr-sm-2" placeholder={"Quantity"} type="text" value={quantity}
                   style={{
                     width: 50, justifyContent: "center", textAlign: "center", paddingRight: 10
                   }}
                   onChange={(event) => setQuantity(event.target.value)} required={true}/>
            <input type="submit" onClick={async (event) => {
              event.preventDefault();
              await addToCart();
            }} className="profile-edit-btn" name="btnAddMore"
                   value="Add to Cart"/>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetail;