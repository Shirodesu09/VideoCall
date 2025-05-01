import React from "react";
import "./MeetCard.css"
function MeetCard() {
    const inviter = "Ahmed Akrout";
    const fileName = "Web Design"; 
    const timeAgo = "At 4:25PM";
  return (
    <div className="card">
      <div className="container">
        <div className="left">
          <div className="status-ind"></div>
        </div>
        <div className="right">
          <div className="text-wrap">
            <p className="text-content">
              <a className="text-link" href="#">
                {inviter}
              </a>{" "}
              started a meeting
              <a className="text-link" href="#">
                {" "}
                {fileName}{" "}
              </a>{" "}
            </p>
            <p className="time">{timeAgo}</p>
          </div>
          <div className="button-wrap">
            <button className="primary-cta">Join</button>
            <button className="secondary-cta">Description</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetCard;
