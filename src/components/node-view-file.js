import React, { createClass } from "react";

const NodeViewFile = createClass({
    getInitialState: function() {
        return {
            isImageLoading: false,
            imageError: null
        }
    },

    render: function() {
        const { imgURL, updateState } = this.props;

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
                            onLoad={this.onImageLoad}
                            onError={this.onImageError}
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
                        const { imgURL } = this.props;
                        const { value } = e.target;
                        
                        updateState({ imgURL: value });

                        if (value !== imgURL) {
                            this.setState({
                                isImageLoading: true,
                                imageError: null
                            });
                        }
                    }}/>
            </div>
        );
    },

    onImageLoad: function(e) {
         this.setState({
            isImageLoading: false,
            imageError: null
        });
    },

    onImageError: function(e) {
         this.setState({
            isImageLoading: false,
            imageError: e
        });
    }
});

export default NodeViewFile;
