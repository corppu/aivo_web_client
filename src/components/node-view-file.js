import React, { createClass } from "react";

const NodeViewFile = createClass({
    getInitialState: function() {
        return {
            isLoading: false,
            error: null
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
                    { this.renderImage() }
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
                                isLoading: true,
                                error: null
                            });
                        }
                    }}/>
            </div>
        );
    },

    renderImage: function() {
        const { imgURL, updateState } = this.props;
        const { isLoading, error } = this.state;

        const hasImage = imgURL && imgURL.length > 0 && !error && !isLoading
        const img = (
            <img
                style={{
                    height: hasImage ? null : 0,
                    visibility: hasImage ? null : "hidden",
                    display: "block",
                    maxWidth: "100%"
                }}
                src={imgURL}
                onLoad={this.onLoad}
                onError={this.onError}
            />
        );
        return (
            <div>
                { img }
                { hasImage
                    ? null
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
            </div>
        );
    },

    onLoad: function(e) {
         this.setState({
            isLoading: false,
            error: null
        });
    },

    onError: function(e) {
         this.setState({
            isLoading: false,
            error: e
        });
    }
});

export default NodeViewFile;
