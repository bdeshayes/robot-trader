import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData, stockSymbol, stockName } from "./utils";

import { TypeChooser } from "react-stockcharts/lib/helper";

class ChartComponent extends React.Component {
	componentDidMount() {
		getData().then(data => {
			this.setState({ data })
		})
	}
	render() {
		if (this.state == null) {
			return <div>Loading...</div>
		}
		return (
            <div>
			<h1 style={{ textAlign: "center" }}>{stockSymbol}</h1>
			<h2 style={{ textAlign: "center" }}>{stockName}</h2>
			<p style={{ textAlign: "center" }}><a href ="/api/results/profitloss/desc">Stocklist</a></p>
			<TypeChooser>
				{type => <Chart type={type} data={this.state.data} />}
			</TypeChooser>
			</ div>
		)
	}
}

render(
	<ChartComponent />,
	document.getElementById("root")
);