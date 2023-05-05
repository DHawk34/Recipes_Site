import React from "react";

type MyProps = {
    // using `interface` is also ok
    width: string,
    height: string
};

export class Hamburger extends React.Component<MyProps, {}> {
    render(): React.ReactNode {
        return (
            <svg width={this.props.width} height={this.props.height} viewBox="0 0 100 80" color="currentColor">
                <rect width="100" height="15" rx="10"></rect>
                <rect y="30" width="100" height="15" rx="10"></rect>
                <rect y="60" width="100" height="15" rx="10"></rect>
            </svg>
        )
    }
}