import { useState } from "react";
import { useLoaderData } from "react-router-dom";

function RoundButton({ size, icon, onClick = () => { }, subClass = "", shadow = true }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
        console.log("prout")
      }}
      className={`rounded-full grid place-items-center cursor-pointer bg-white transition-shadow duration-150 ease-out ${subClass} ${shadow ? "shadow-[0_3px_7px_rgba(0,0,0,0.2)]" : ""}`}
      style={{ height: size + "px", width: size + "px" }}>
      <i className={icon} ></i>
    </div>
  )
}

export default function EditButtons({ onClick }) {

  const [isEditing, setIsEditing] = useState(false);

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

    if (!("buttonaction" in elt.attributes)) {
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
    <div className="flex w-[180px] overflow-visible justify-end">
      <div className={`relative pl-[5px] pr-[11px] pt-[4px] pb-[11px] z-0 absolute left-[63px] transition-[left] duration-150 ease-out ${isEditing ? "left-0" : ""}`}>
        <RoundButton size={btnSize} icon="ri-save-2-line" shadow={isEditing} />
      </div>
      <div className="relative pl-[5px] pr-[11px] pt-[4px] pb-[11px] z-10">
        <RoundButton
          size={btnSize}
          onClick={() => { setIsEditing(!isEditing) }}
          icon={isEditing ? "ri-arrow-go-back-line" : "ri-pencil-fill"}
        />
      </div>
      <div className="relative pl-[5px] pr-[11px] pt-[4px] pb-[11px] z-10">
        <RoundButton size={btnSize} icon="ri-delete-bin-line" />
      </div>
    </div>
  )
}
