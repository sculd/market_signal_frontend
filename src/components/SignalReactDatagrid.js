import React from 'react'
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise'
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter'
import '@inovua/reactdatagrid-enterprise/index.css'

const columns = [
    {
        name: 'datetime_et',
        header: 'Datetime',
        render: ({ value }) => Date(value).toLocaleString(),
        minWidth: 180
    },
    { 
      name: 'symbol', 
      header: 'Symbol',
      filterEditor: SelectFilter,
      maxWidth: 100
    },
    {
      name: 'recent_price',
      header: 'Current',
      render: ({ value }) => "$" + String(Number(value).toFixed(1)),
      maxWidth: 80
    },
    {
      name: 'window_size_minutes',
      header: 'Window',
      maxWidth: 100
    },
    {
      name: 'threshold',
      header: 'Threshold',
      render: ({ value }) => String(Number(value * 100).toFixed(2)) + "%",
      maxWidth: 80
    },
    {
      name: 'type_str',
      header: 'Type',
    },
    {
      name: 'summary',
      header: 'Summary@', 
      minWidth: 800,
      maxWidth: 1000
    },
    ];

const gridStyle = { minHeight: 550 }

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }
  }
`;

function SignalDataGrid() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isStockLoading, setIsStockLoading] = useState(true);
    const [isCryptoLoading, setIsCryptoLoading] = useState(true);
    const [stockItems, setStockIItems] = useState([]);
    const [cryptoItems, setCryptoItems] = useState([]);
  
    function addIdsToRows(rows) {
      let id = 0;
      rows.forEach(row => {
          row['id'] = id;
          id += 1;
      });
      return rows;
    }
  
    function fetchUpdateStock() {
      setIsStockLoading(true);
      fetch(
        "https://7tj23qrgl1.execute-api.us-east-2.amazonaws.com/test/moves?market=stock",
        {
          method: "get",
          headers: new Headers({
            "x-api-key": process.env.REACT_APP_API_GATEWAY_API_KEY
          })
        }
      )
      .then(
        (response) => {
        return response.json();
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
      .then(data => {
        setIsLoaded(true);
        setIsStockLoading(false);
        if (stockItems !== undefined) {
          setStockIItems(addIdsToRows(data));
        }
      });
    }
  
    function fetchUpdateCrypto() {
      setIsCryptoLoading(true);
      fetch(
        "https://7tj23qrgl1.execute-api.us-east-2.amazonaws.com/test/moves?market=binance",
        {
          method: "get",
          headers: new Headers({
            "x-api-key": process.env.REACT_APP_API_GATEWAY_API_KEY
          })
        }
      )
      .then(
        (response) => {
        return response.json();
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
      .then(data => {
        setIsLoaded(true);
        setIsCryptoLoading(false);
        if (cryptoItems !== undefined) {
          setCryptoItems(addIdsToRows(data));
        }
      });
    }
  
    function onInterval() {
      fetchUpdateStock();
      fetchUpdateCrypto();
    }
    
    useEffect(() => {
      const interval = setInterval(() => onInterval(), 1000 * 60);
      return () => {
        clearInterval(interval);
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
    useEffect(() => {
      fetchUpdateStock();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    useEffect(() => {
      fetchUpdateCrypto();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
      
    const Loading = () => (
      <div>
        Loading...
      </div>
    )
  
    const Error = () => (
        <div>
          Error loading.
        </div>
      )
    
      const IsLoaded = () => (
        <div></div>
      )
    
    return (
        <Styles>
          <Tabs>
            <TabList>
              <Tab>Stock</Tab>
              <Tab>Crypto</Tab>
            </TabList>
        
            <div>
              { isStockLoading || isCryptoLoading ? <Loading /> : null }
              { error ? <Error />  : null }
              { isLoaded? <IsLoaded /> : null }
            </div>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={columns}
                    dataSource={stockItems}
                    style={gridStyle}
                />
            </TabPanel>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={columns}
                    dataSource={cryptoItems}
                    style={gridStyle}
                />
            </TabPanel>
          </Tabs>
        </Styles>
    );
  }
  
export default SignalDataGrid;
