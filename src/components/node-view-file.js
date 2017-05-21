import React from "react";

export default function({ imgURL, updateState }) {

    // TODO: Handle excessively tall media properly

    return (
        <div>
            <center
                style={{
                    marginBottom: 24
                }}>
                { imgURL && imgURL.length > 0
                    ? <img
                        style={{
                            display: "block",
                            maxWidth: "100%"
                        }}
                        src={imgURL}
                        //onLoad={e => { console.log(e); }}
                        //onError={e => { console.log(e); }}
                        />
                    : <div
                        style={{
                            color: "#e4e4e4"
                        }}>
                        <div
                            style={{
                                padding: "72px 0",
                                border: "dashed",
                                borderWidth: 2,
                                borderColor: "#e4e4e4"
                            }}>
                            <i className="fa fa-picture-o fa-5x"/>
                        </div>
                    </div>
                }
            </center>
            <input
                className="node-input input width-full"
                value={ imgURL || "" }
                placeholder="Insert file URL here..."
                onChange={(e) => {
                    const { value } = e.target;
                    

                    updateState({ imgURL: value });
                }}/>
        </div>
    );
}
