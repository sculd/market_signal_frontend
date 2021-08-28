import React from "react";
import { useLocation } from "react-router-dom";
import TradingViewWidget from 'react-tradingview-widget';

function Chart() {
  const search = useLocation().search;
  const symbol = new URLSearchParams(search).get("symbol");

  return (
    <TradingViewWidget symbol={symbol} interval="1" timezone="America/New_York" />
  );
}

export default Chart;
