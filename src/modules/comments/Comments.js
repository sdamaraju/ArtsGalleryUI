import React, {useEffect, useState} from 'react';
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import "../styles/box.css"
import {serverURL} from "../../app.constants";
import {isEmpty} from "../utils/util";

const Comments = (props) => {
  const [newCommentText, setNewCommentText]=useState("");
  const [comment, setComment] = useState({});
  const [comments, setComments] = useState([]);
  const [isStale, setIsStale] = useState(true);

  useEffect(async () => {
    if(isStale){
      await loadComments();
      setIsStale(false);
    }
  },[isStale])

  const likeComment = async (likedComment) => {
    fetch(`${serverURL}/likeComment?commentID=${likedComment.commentID}`,{method: 'PUT'})
      .then(response => response.json())
      .then(async (data) => {
        await loadComments();
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }

  const loadComments = async () => {
    fetch(`${serverURL}/comments?productID=${props.productID}`)
      .then(response => response.json())
      .then(data => {
        if(!data.error){setComments(data)};
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }

  const publishComment = async (newComment) => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        comment: newComment,
        userID: props.userID,
        productID: props.productID,
        dateAdded: new Date(),
        likesCount:0,
      })
    };
    fetch(`${serverURL}/comment`, requestOptions)
      .then(response => response.json())
      .then(async(data) => {
        await loadComments();
      })
      .catch((error) => {
        console.log(error)
        alert(error);
      });
  }

  const renderAddCommentCard = () => {
    return (
      <Card style={{width: '18rem'}} className="box commentsBox">
        <Card.Header style={{backgroundColor: "#688fc7", height:50}}>
          <div style={{paddingTop: 5, color: "White"}}>
            <Card.Title>{"Please add a comment .."}</Card.Title>
          </div>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <textarea style={{height: "65",width:"100%"}} rows={2} placeholder={"Please say anything about the product"} type="text" value={newCommentText}
                      onChange={(event) => setNewCommentText(event.target.value)}/>
          </Card.Text>
        </Card.Body>
        <Card.Footer style={{height: 55}}>
          <div className="row">
            <div className="col">
              <Card.Text style={{textAlign: "left"}}>
                <Button onClick={() => setNewCommentText("")} variant="outline-info">Clear</Button>
              </Card.Text>
            </div>
            <div className="col" class="align-right" style={{paddingRight: 10}}>
              <Button onClick={async(event) => {
                if(isEmpty(newCommentText)) return false;
                event.preventDefault();
                await publishComment(newCommentText);
                setNewCommentText("");
              }} variant="outline-info">Post</Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  }

  const renderComment = (comment) => {
    return (
      <Card style={{width: '18rem'}} className="box commentsBox">
        <Card.Header style={{backgroundColor: "#688fc7" , height:50}}>
          <div className="row" style={{paddingTop: 5, color: "White"}}>
            <div className="col">
              <Card.Title>{isEmpty(comment.userName) ? "You just posted .." : comment.userName}</Card.Title>
            </div>
            <div className="col" className="align-right">
              <Card.Subtitle style={{paddingRight: 10}}>{new Date(comment.dateAdded).toDateString()}</Card.Subtitle>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            {comment.comment.length > 150 ? comment.comment.substr(0, 150) + "..." : comment.comment}
          </Card.Text>
        </Card.Body>
        <Card.Footer style={{height: 55}}>
          <div className="row">
            <div className="col">
              <Card.Text style={{textAlign: "left", paddingTop: 5}}>
                {"Likes : " + comment.likesCount}
              </Card.Text>
            </div>
            <div className="col" class="align-right" style={{paddingRight: 10}}>
              <Button onClick={async (event) =>{
                event.preventDefault();
                await likeComment(comment)
              }} variant="outline-info">Like</Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  }

  return (
    <div>
      <div style={{display: "flex", justifyContent: "flex-end", paddingRight: 15, paddingTop: 15}}>
        <input type="submit" onClick={async (event) => props.hideComments()} value="Hide Comments"/>
      </div>
      <div className="commentsGrid">
        {renderAddCommentCard()}
      </div>
      <div className="commentsGrid">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default Comments;