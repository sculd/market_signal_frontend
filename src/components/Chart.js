import React from 'react'
import { createChart, isBusinessDay } from "lightweight-charts";
import { useEffect, useRef } from "react";

const Chart = (props) => {
  const {
    data
  } = props;

  const chartRef = useRef(null);
  useEffect(() => {
    const chart = createChart(chartRef.current, { width: 600, height: 200 });
    chart.applyOptions({
      localization: {
          locale: 'en-US',
          timeFormatter: businessDayOrTimestamp => {
              if (isBusinessDay(businessDayOrTimestamp)) {
                  return new Date(businessDayOrTimestamp * 1000);
              }
              return new Date(businessDayOrTimestamp * 1000);
          },
      },
    });
    const lineSeries = chart.addLineSeries();
    lineSeries.setData(data);
    const eventLines = chart.addLineSeries({
      color: '#f48fb1',
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#ffffff',
      crosshairMarkerBackgroundColor: '#2296f3',
      lineType: 1,
    });
    eventLines.setData([
      { time: 1529884300, value: 70.00 - 1 },
      { time: 1529884300, value: 74.00 + 1},
    ]);
  }, []);

  return <div ref={chartRef} />;
};

export default Chart;
