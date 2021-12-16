import React from 'react'
import { createChart, isBusinessDay } from "lightweight-charts";
import { useEffect, useState, useRef } from "react";
import { Spinner } from 'reactstrap';
import { marketPriceBaseUrl } from "../utils/apiUrls";

const Chart = (props) => {
  const {
    market,
    symbol,
    eventEpochSeconds,
    priceAtMaxJump,
    maxJumpEpochSeconds,
    minPriceForMaxJump,
    minPriceForMaxJumpEpochSeconds,
    priceAtMinDrop,
    minDropEpochSeconds,
    maxPriceForMinDrop,
    maxPriceForMinDropEpochSeconds,
    windowSizeMinutes
  } = props;

  const [error, setError] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toTwDigits = (v) => { 
    if (parseInt(v) < 10) { 
      return '0' + v 
    } else { 
      return '' + v
    } 
  }
  
  function fetchTimeseries() {
    const beginEpochSeconds = Math.min(maxJumpEpochSeconds, minDropEpochSeconds, eventEpochSeconds) - 60 * 5
    const eventTime = new Date(eventEpochSeconds * 1000)
    const fromTime = new Date(beginEpochSeconds * 1000)

    const from_epoch_datetime = `${fromTime.getFullYear()}-${toTwDigits(fromTime.getMonth()+1)}-${toTwDigits(fromTime.getDate())}T${toTwDigits(fromTime.getHours())}:${toTwDigits(fromTime.getMinutes())}:00-04:00`
    const url = `${marketPriceBaseUrl}/history/markets/${market}/symbols/${symbol}?from=${from_epoch_datetime}`
    setIsLoading(true)
    fetch(
      url,
      {
        method: "get",
        headers: new Headers({
          "x-api-key": process.env.REACT_APP_API_GATEWAY_PIRCE_HISTORY_API_KEY
        })
      }
    )
    .then(
      (response) => {
        return response.json();
      },
      (error) => {
        setError(error);
      }
    )
    .then(data => {
      if (timeseries !== undefined) {
        setTimeseries(data.map((b) => { return {time: b['t'], value: b['c']}}));
      }
      setIsLoading(false)
    });
  }

  useEffect(() => {
    fetchTimeseries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const chartRef = useRef(null);
  useEffect(() => {
    if (timeseries === undefined || timeseries.length === 0) {
      return
    }
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
      timeScale: { // time format - x축
        barSpacing: 20, // 그래프 사이의 간격
        tickMarkFormatter: (time, tickMarkType, locale) => {
          const t = new Date(time * 1000)
          return `${toTwDigits(t.getHours())}:${toTwDigits(t.getMinutes())}`
        },
      },
    });
    const lineSeries = chart.addLineSeries();
    lineSeries.setData(timeseries);
    const jumpLines = chart.addLineSeries({
      title: 'Jump',
      color: 'blue',
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: false,
    });
    const maxValue = Math.max(...timeseries.map(v => v['value']))
    const minValue = Math.min(...timeseries.map(v => v['value']))
    console.log('maxValue', maxValue, 'minValue', minValue)
    jumpLines.setData([
      { time: minPriceForMaxJumpEpochSeconds, value: minPriceForMaxJump },
      { time: maxJumpEpochSeconds, value: priceAtMaxJump },
    ]);
    const dropLines = chart.addLineSeries({
      title: 'Drop',
      color: 'red',
      lineStyle: 0,
      lineWidth: 1,
      crosshairMarkerVisible: false,
      //lineType: 1,
    });
    dropLines.setData([
      { time: maxPriceForMinDropEpochSeconds, value: maxPriceForMinDrop },
      { time: minDropEpochSeconds, value: priceAtMinDrop },
    ]);
    chart.timeScale().fitContent();
  }, [timeseries]);

  return (
    <div>
      {isLoading && (
        <Spinner size="sm" color="primary" />
      )}
      <div ref={chartRef} />
    </div>
    );
};

export default Chart;
