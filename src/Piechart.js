import React, { Component } from "react";
import * as d3 from "d3";

import { groupByFunc } from "./util";

// borrowed from http://bl.ocks.org/mbostock/5100636
function arcTween(oldD, newD, arc) {
    const copy = { ...oldD };
    return function(d) {
        const interpolateStartAngle = d3.interpolate(
                oldD.startAngle,
                newD.startAngle
            ),
            interpolateEndAngle = d3.interpolate(oldD.endAngle, newD.endAngle);

        return function(t) {
            copy.startAngle = interpolateStartAngle(t);
            copy.endAngle = interpolateEndAngle(t);
            return arc(copy);
        };
    };
}

class Arc extends Component {
    arc = d3
        .arc()
        .innerRadius(80)
        .outerRadius(150)
        .cornerRadius(8);

    constructor(props) {
        super(props);

        this.state = {
            color: props.color,
            origCol: props.color,
            d: props.d
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            color: newProps.color
        });

        d3
            .select(this.refs.elem)
            .transition()
            .duration(30)
            .attrTween("d", arcTween(this.state.d, newProps.d, this.arc))
            .on("end", () =>
                this.setState({
                    d: newProps.d,
                    pathD: this.arc(newProps.d)
                })
            );
    }

    componentDidUpdate() {
        const { _pathD } = this.state;
    }

    click = () => {
        const { data: { tag, amount } } = this.props.d;
    };

    hover = () => {
        this.setState({
            color: this.state.color.saturate(2)
        });
    };

    unhover = () => {
        this.setState({
            color: this.state.origCol
        });
    };

    render() {
        const { color, pathD } = this.state;

        return (
            <path
                d={pathD}
                style={{
                    fill: color
                }}
                onClick={this.click}
                onMouseOver={this.hover}
                onMouseOut={this.unhover}
                ref="elem"
            />
        );
    }
}

class Piechart extends Component {
    pie = d3
        .pie()
        .value(d => d.amount)
        .sortValues(d => d.tag)
        .padAngle(0.005);

    render() {
        const { data, groupBy, x, y, color } = this.props;

        const _data = groupByFunc(data, groupBy);

        return (
            <g transform={`translate(${x}, ${y})`}>
                {this.pie(_data).map((d, i) => (
                    <g key={d.data.tag}>
                        <Arc d={d} color={color(d)} />
                    </g>
                ))}
                <text x="-10">{data.length}</text>
                <text y="15" x="-40">
                    datapoints
                </text>
            </g>
        );
    }
}

export default Piechart;
