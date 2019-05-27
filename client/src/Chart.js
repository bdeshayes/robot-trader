import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
	CandlestickSeries,
	LineSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import {
	OHLCTooltip,
	MovingAverageTooltip,
} from "react-stockcharts/lib/tooltip";
import { ema } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import algo from "react-stockcharts/lib/algorithm";
import {
	Annotate,
	SvgPathAnnotation,
	buyPath,
	sellPath,
} from "react-stockcharts/lib/annotation";
import { last } from "react-stockcharts/lib/utils";
import { JsonToTable } from "react-json-to-table";
import { stockSymbol } from "./utils";

var sprintf = require('sprintf-js').sprintf;

var trades = [];
var balance = 0.0;
var profitloss = 0.0;
var lastpos = '';
var lastvalue = 0.0;
var urlupdate = '';

class MovingAverageCrossOverAlgorithmV2 extends React.Component {
	render() {
		const { type, data: initialData, width, ratio } = this.props;

		const ema20 = ema()
			.id(0)
			.options({ windowSize: 13 })
			.merge((d, c) => { d.ema20 = c; })
			.accessor(d => d.ema20);

		const ema50 = ema()
			.id(2)
			.options({ windowSize: 50 })
			.merge((d, c) => { d.ema50 = c; })
			.accessor(d => d.ema50);

		const buySell = algo()
			.windowSize(2)
			.accumulator(([prev, now]) => {
				const { ema20: prevShortTerm, ema50: prevLongTerm } = prev;
				const { ema20: nowShortTerm, ema50: nowLongTerm } = now;
				if (prevShortTerm < prevLongTerm && nowShortTerm > nowLongTerm) 
					{
//					if (balance == 0.0)
					if (trades.length === 0)
						{
						balance -= now.close;
						trades.push ({"date": now.date.toDateString(), "pos": "OPEN LONG (BUY)", 
						"value": now.close, 
						"balance": sprintf("%5.2f", balance), 
						"profit/loss": sprintf("%5.2f", profitloss)});
						}
					else
						{
						balance -= now.close * 2;
						profitloss += lastvalue - now.close;
						trades.push ({"date": now.date.toDateString(), "pos": "REVERSE LONG", 
						"value": now.close, 
						"balance": sprintf("%5.2f", balance), 
						"profit/loss": sprintf("%5.2f", profitloss)});
						}
					lastpos = "LONG";
					lastvalue = now.close;
					return "LONG";
					}
					
				if (prevShortTerm > prevLongTerm && nowShortTerm < nowLongTerm) 
					{
					if (trades.length === 0)
						{
						balance += now.close;
						trades.push ({"date": now.date.toDateString(), "pos": "OPEN SHORT (SELL)", 
						"value": now.close, 
						"balance": sprintf("%5.2f", balance), 
						"profit/loss": sprintf("%5.2f", profitloss)});
						}
					else
						{
						balance += now.close * 2;
						profitloss += now.close - lastvalue;
						trades.push ({"date": now.date.toDateString(), 
						"pos": "REVERSE SHORT", 
						"value": now.close, 
						"balance": sprintf("%5.2f", balance), 
						"profit/loss": sprintf("%5.2f", profitloss)});
						}
					lastpos = "SHORT";
					lastvalue = now.close;
					return "SHORT";
					}
			})
			.merge((d, c) => { d.longShort = c; });

		const defaultAnnotationProps = {
			onClick: console.log.bind(console),
		};

		const longAnnotationProps = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => yScale(datum.low),
			fill: "#0000FF",
			path: buyPath,
			tooltip: "Go long", // + datum.date.toDateString() + "\n" + datum.close,
		};

		const shortAnnotationProps = {
			...defaultAnnotationProps,
			y: ({ yScale, datum }) => yScale(datum.high),
			fill: "#FF0000",
			path: sellPath,
			tooltip: "Go short",
		};

const candlesAppearance = {
  wickStroke: "#000000",
  fill: function fill(d) {
    return d.close > d.open ? "rgba(255, 255, 255, 0.8)" : "rgba(22, 22, 22, 0.8)";
  },
  stroke: "#000000",
  candleStrokeWidth: 1,
  widthRatio: 0.8,
  opacity: 1,
}
		const margin = { left: 80, right: 80, top: 30, bottom: 50 };
		const height = 400;

	//	const [yAxisLabelX, yAxisLabelY] = [width - margin.left - 40, margin.top + (height - margin.top - margin.bottom) / 2];

		const calculatedData = buySell(ema50(ema20(initialData)));
		const xScaleProvider = discontinuousTimeScaleProvider
			.inputDateAccessor(d => d.date);
		const {
			data,
			xScale,
			xAccessor,
			displayXAccessor,
		} = xScaleProvider(calculatedData);

		const start = xAccessor(last(data));
		const end = xAccessor(data[Math.max(0, data.length - 150)]);
		const xExtents = [start, end];
		console.log(end);
		
var lastpoint = data[data.length-1];
var firstpoint = data[0];

		if (trades.length !== 0)
			{
			if (lastpos === 'SHORT')
				{
				balance -= lastpoint.close;
				profitloss += lastvalue - lastpoint.close;
				trades.push ({"date": lastpoint.date.toDateString(), 
							"pos": "CLOSE SHORT (BUY)", "value":lastpoint.close, 
							"balance": sprintf("%5.2f", balance), 
							"profit/loss": sprintf("%5.2f", profitloss)});
				}
				
			if (lastpos === 'LONG')
				{
				balance += lastpoint.close;
				profitloss += lastpoint.close - lastvalue;
				trades.push ({"date": lastpoint.date.toDateString(), 
							"pos": "CLOSE LONG (SELL)", "value":lastpoint.close, 
							"balance": sprintf("%5.2f", balance), 
							"profit/loss": sprintf("%5.2f", profitloss)});
				}
			var nbtrades = trades.length - 1;
			var profitstr = profitloss > 0 ? sprintf("%5.2f%% profit", 100*profitloss/firstpoint.close) : sprintf("%5.2f%% loss", 100*profitloss/firstpoint.close);
			var endDate = lastpoint.date.getFullYear() + '-' +(lastpoint.date.getMonth()+1) + '-' +lastpoint.date.getDate();
			var startDate = firstpoint.date.getFullYear() + '-' +(firstpoint.date.getMonth()+1) + '-' +firstpoint.date.getDate();
			urlupdate = '/api/result/'+stockSymbol+'/'+ sprintf("%5.2f", 100*profitloss/firstpoint.close) +'/'+ nbtrades +'/'+ startDate +'/' + endDate;
			}
			
		return (
			<div>
			<ChartCanvas height={height}
					width={width}
					ratio={ratio}
					margin={margin}
					type={type}
					seriesName="STOCK"
					data={data}
					xScale={xScale}
					xAccessor={xAccessor}
					displayXAccessor={displayXAccessor}
					xExtents={xExtents}>
				<Chart id={1}
						yExtents={[d => [d.high, d.low], ema20.accessor(), ema50.accessor()]}
						padding={{ top: 10, bottom: 20 }}>
					<XAxis axisAt="bottom" orient="bottom"/>

					<YAxis axisAt="right" orient="right" ticks={5} />

					<MouseCoordinateX
						at="bottom"
						orient="bottom"
						displayFormat={timeFormat("%Y-%m-%d")} />
					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".2f")} />

					<CandlestickSeries fill={candlesAppearance.fill} />
					<LineSeries yAccessor={ema20.accessor()} stroke={ema20.stroke()}/>
					<LineSeries yAccessor={ema50.accessor()} stroke={ema50.stroke()}/>

					<CurrentCoordinate yAccessor={ema20.accessor()} fill={ema20.stroke()} />
					<CurrentCoordinate yAccessor={ema50.accessor()} fill={ema50.stroke()} />
					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

					<OHLCTooltip origin={[-40, 0]}/>
					<MovingAverageTooltip
						onClick={e => console.log(e)}
						origin={[-38, 15]}
						options={[
							{
								yAccessor: ema20.accessor(),
								type: "EMA",
								stroke: ema20.stroke(),
								windowSize: ema20.options().windowSize,
							},
							{
								yAccessor: ema50.accessor(),
								type: "EMA",
								stroke: ema50.stroke(),
								windowSize: ema50.options().windowSize,
							},
						]}
						/>

					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "LONG"}
						usingProps={longAnnotationProps} />
					<Annotate with={SvgPathAnnotation} when={d => d.longShort === "SHORT"}
						usingProps={shortAnnotationProps} />

				</Chart>
				<CrossHairCursor />
			</ChartCanvas>
			<JsonToTable json={trades} />	
			<p style={{ textAlign: "center" }}>{profitstr} over {nbtrades} trades<br /><a href={urlupdate} >Update results</a> </p>
			</ div>
		);
	}
}

/*
		
		<LineSeries yAccessor={d => d.close} stroke="#000000" />

*/

MovingAverageCrossOverAlgorithmV2.propTypes = {
	data: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

MovingAverageCrossOverAlgorithmV2.defaultProps = {
	type: "svg",
};

MovingAverageCrossOverAlgorithmV2 = fitWidth(MovingAverageCrossOverAlgorithmV2);

export default MovingAverageCrossOverAlgorithmV2;