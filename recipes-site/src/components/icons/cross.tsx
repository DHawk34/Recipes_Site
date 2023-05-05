import React from "react";

type MyProps = {
    // using `interface` is also ok
    width: string,
    height: string
};

export class Cross extends React.Component<MyProps, {}> {
    render(): React.ReactNode {
        return (
            <svg width={this.props.width} height={this.props.height} fill="currentColor" viewBox="0 0 16 16"> <path d="M1.7,1.7C2,1.3,2.6,1.3,3,1.7c0,0,0,0,0,0l4.8,4.8l4.8-4.8c0.4-0.4,0.9-0.4,1.3,0c0.4,0.4,0.4,0.9,0,1.3L9.1,7.8l4.8,4.8
            c0.4,0.4,0.4,0.9,0,1.3c-0.4,0.4-0.9,0.4-1.3,0L7.8,9.1L3,13.9c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l4.8-4.8L1.7,3
            C1.3,2.6,1.3,2,1.7,1.7C1.7,1.7,1.7,1.7,1.7,1.7z"/> </svg>
        )
    }
}