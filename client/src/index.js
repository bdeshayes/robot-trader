import React from 'react';
import { render } from 'react-dom';
import Chart from './Chart';
import { getData, stockSymbol, stockName } from "./utils";

/*class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
	console.log(error);
	console.log(info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}*/

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
			{/*	<ErrorBoundary> */}
			<Chart type='hybrid' data={this.state.data} />
			{/*</ErrorBoundary> */}
			</ div>
		)
	}
}

render(
	<ChartComponent />,
	document.getElementById("root")
);