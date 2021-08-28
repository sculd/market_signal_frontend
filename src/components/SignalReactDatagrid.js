import React from 'react'
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise'
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter'
import '@inovua/reactdatagrid-enterprise/index.css'

const getColumn = (items) => {
  return [
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
      filterEditorProps: {
        placeholder: 'All',
        dataSource: [... new Set(items.map(i => i['symbol']))].map(s => { return {id: s, label: s} })
      },
      render: ({ value, data }) => {
        const to = `/chart?symbol=${value}`
        return <div style={{ display: 'inline-block' }}>
          <Link to={to} target="_blank">{value}</Link>
        </div>
      },
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
      maxWidth: 100,
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: 'All',
        dataSource: [{id: 10, label: '10'}, {id: 20, label: '20'}, {id: 30, label: '30'}, {id: 60, label: '60'}]
      },
    },
    {
      name: 'threshold',
      header: 'Threshold',
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: 'All',
        dataSource: [{id: "0.1", label: '10%'}, {id: "0.2", label: '20%'}, {id: "0.3", label: '30%'}]
      },
      render: ({ value }) => String(Number(value * 100).toFixed(0)) + "%",
      maxWidth: 100
    },
    {
      name: 'type_str',
      header: 'Type',
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: 'All',
        dataSource: [{id: "Jump", label: 'Jump'}, {id: "Drop", label: 'Drop'}]
      },
    },
    {
      name: 'summary',
      header: 'Summary', 
      minWidth: 800,
      maxWidth: 1000
    },
  ]
}

const baseColumns = getColumn([]);
  
const gridStyle = { 
  minHeight: 1200 
}

const Styles = styled.div`
  padding: 1rem 5rem;

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
        
    const cryptoFilterValue = [
      { name: 'symbol', operator: 'eq', type: 'select', value: null },
      { name: 'window_size_minutes', operator: 'eq', type: 'select', value: null },
      { name: 'threshold', operator: 'eq', type: 'select', value: null },
      { name: 'type_str', operator: 'eq', type: 'select', value: null }
    ];

    const [stockColumns, setStockColumns] = useState(baseColumns);
    const [cryptoColumns, setCryptoColumns] = useState(baseColumns);

    useEffect(() => {
      setCryptoColumns(getColumn(stockItems))
    }, [cryptoItems]); // eslint-disable-line react-hooks/exhaustive-deps
      
    useEffect(() => {
      setCryptoColumns(getColumn(cryptoItems))
    }, [cryptoItems]); // eslint-disable-line react-hooks/exhaustive-deps
  
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
                    columns={stockColumns}
                    dataSource={stockItems}
                    style={gridStyle}
                />
            </TabPanel>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={cryptoColumns}
                    dataSource={cryptoItems}
                    style={gridStyle}
                    defaultFilterValue={cryptoFilterValue}
                />
            </TabPanel>
          </Tabs>
        </Styles>
    );
  }
  
export default SignalDataGrid;
