import { useState } from "react";
import { useLoaderData } from "react-router-dom";

import "./EditButtons.css"

function RoundButton({size, icon, onClick = () => {}, subClass = "", shadow = true}) {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
        console.log("prout")
      }} 
      className={"round-button " + subClass + (shadow ? " round-button-shadowed" : "")} style={{height: size + "px", width: size + "px"}}>
      <i className={icon} ></i>
    </div>
  )
}

export default function EditButtons({onClick}) {

  const [isEditing, setIsEditing] = useState();

  const spacing = 16;
  const btnSize = 48;

  const internalOnClick = (event) => {
    event.stopPropagation()
    let elt = event.target
    if (elt.localName === "i") {
      elt = elt.parentElement.parentElement.parentElement
    } else if (elt.localName === "span") {
      elt = elt.parentElement.parentElement
    } else if (elt.localName === "a") {
      elt = elt.parentElement
    }

    if (!"buttonaction" in elt.attributes) {
      console.log("Cannot find clicked element name")
      return
    }

    const buttonname = elt.attributes.buttonaction.value;
    
    if (buttonname === "edit") {
      setIsEditing(true)
    }
    if (buttonname === "save" || buttonname === "cancel") {
      setIsEditing(false)
    }
    
    onClick(buttonname)
  }

  return (
    <div className="edit-buttons">
      <div className={"round-button-container third-button " + (isEditing ? "third-button-visible" : "")}>
        <RoundButton size={btnSize} icon="ri-save-2-line" shadow={isEditing}/>
      </div>
      <div className="round-button-container">
        <RoundButton 
          size={btnSize} 
          onClick={() => {setIsEditing(!isEditing)}}
          icon={isEditing ? "ri-arrow-go-back-line" : "ri-pencil-fill"}
        />
      </div>
      <div className="round-button-container">
        <RoundButton size={btnSize} icon="ri-delete-bin-line" />
      </div>
    </div>
    // <div onClick={internalOnClick} class="tabs is-toggle is-toggle-rounded">
    //   <ul>
    //     { !isEditing && (
    //       <>
    //         <li buttonaction="edit">
    //           <a className="has-background-info-light">
    //             <span class="icon is-small"><i class="ri-pencil-fill"></i></span>
    //           </a>
    //         </li>
    //         <li buttonaction="delete">
    //           <a className="has-background-danger-light">
    //             <span class="icon is-small"><i class="ri-delete-bin-line"></i></span>
    //           </a>
    //         </li>
    //       </>
    //     )}
    //     { isEditing && (
    //       <>
    //         <li buttonaction="save">
    //           <a>
    //             <span class="icon is-small"><i class="ri-save-2-line"></i></span>
    //           </a>
    //         </li>
    //         <li buttonaction="cancel">
    //           <a>
    //             <span class="icon is-small"><i class="ri-arrow-go-back-line"></i></span>
    //           </a>
    //         </li>
    //         <li buttonaction="delete">
    //           <a>
    //             <span class="icon is-small"><i class="ri-delete-bin-line"></i></span>
    //           </a>
    //         </li>
    //       </>
    //     )}
    //   </ul>
    // </div>
  )
}

