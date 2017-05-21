import React from "react";

export default function({ text, updateState }) {
    return (
        <textarea
            className="node-input"
            style={{
                border: "none",
                overflow: "auto",
                outline: "none",
                resize: "none",

                WebkitBoxShadow: "none",
                MozBoxShadow: "none",
                boxShadow: "none",

                width: "100%",
                height: "100%",
            }}
            placeholder="Click to edit text..."
            value={ text || "" }
            onChange={(e) => {
                const { value } = e.target;
                
                updateState({ text: value });
            }}/>
    );
}
