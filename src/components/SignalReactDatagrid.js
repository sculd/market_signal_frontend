import React from 'react'
import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise'
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter'
import '@inovua/reactdatagrid-enterprise/index.css'
import Chart from './Chart'

const renderRowDetails = ({ data }) => {
  const eventTime = new Date(data['timestamp'] * 1000);

  return <div style={{ padding: 20}} >
    <p>red: drop, blue: jump</p>
    <Chart 
      market={data['market']}
      symbol={data['symbol']}
      eventEpochSeconds={parseInt(eventTime.getTime() / 1000)}
      priceAtMaxJump={data['price_at_max_jump']}
      maxJumpEpochSeconds={data['max_jump_epoch_seconds']}
      minPriceForMaxJump={data['min_price_for_max_jump']}
      minPriceForMaxJumpEpochSeconds={data['min_price_for_max_jump_epoch_seconds']}
      priceAtMinDrop={data['price_at_min_drop']}
      minDropEpochSeconds={data['min_drop_epoch_seconds']}
      maxPriceForMinDrop={data['max_price_for_min_drop']}
      maxPriceForMinDropEpochSeconds={data['max_price_for_min_drop_epoch_seconds']}
      windowSizeMinutes={data['window_size_minutes']}
      type={data['type_str']}
      />
  </div>
};

const getColumn = (items) => {
  return [
    {
        name: 'date',
        header: 'Date',
        render: ({ value }) => value,
        minWidth: 80
    },
    {
        name: 'timestamp',
        header: 'Datetime',
        render: ({ value }) => {
          return new Date(value * 1000).toLocaleTimeString('en-US');
        },
        minWidth: 150
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
      maxWidth: 120
    },
    {
      name: 'recent_price',
      header: 'Current',
      render: ({ value }) => value ? "$" + String(Number(value).toFixed(1)) : '',
      maxWidth: 100
    },
    {
      name: 'window_size_minutes',
      header: 'Window',
      maxWidth: 120,
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
      render: ({ value }) => value ? String(Number(value * 100).toFixed(0)) + "%" : '',
      maxWidth: 140
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
      minWidth: 600,
      render: ({ data }) => {
        const jumpStr = `Jump ${(data.max_jump * 100).toFixed(0)}% to $${data.price_at_max_jump} at ${new Date(data.max_jump_epoch_seconds * 1000).toLocaleTimeString()}`;
        const dropStr = `Drop ${(data.min_drop * 100).toFixed(0)}% to $${data.price_at_min_drop} at ${new Date(data.min_drop_epoch_seconds * 1000).toLocaleTimeString()}`;
        if (data.max_jump < parseFloat(data.threshold)) {
          return dropStr
        }
        if (Math.abs(data.min_drop) < parseFloat(data.threshold)) {
          return jumpStr
        }
        var former = jumpStr;
        var latter = dropStr;
        if (data.max_jump_epoch_seconds > data.min_drop_epoch_seconds) {
          former = dropStr;
          latter = jumpStr;
        }
        return `${former} and ${latter}`;
      }
    },
  ]
}

const baseColumns = getColumn([]);
  
const gridStyle = { 
  minHeight: 1000 
}

const Styles = styled.div`
  padding: 1rem 5rem; /* vert hor  */

  max-width: 1500px;

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
    const [isKrakenLoading, setIsKrakenLoading] = useState(true);
    const [stockItems, setStockItems] = useState([]);
    const [binanceItems, setBinanceItems] = useState([]);
    const [krakenItems, setKrakenItems] = useState([]);
  
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
        "https://7tj23qrgl1.execute-api.us-east-2.amazonaws.com/test/moves?market=polygon",
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
          setStockItems(addIdsToRows(data));
        }
      });
    }
  
    function fetchUpdateBinance() {
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
        if (binanceItems !== undefined) {
          setBinanceItems(addIdsToRows(data));
        }
      });
    }
  
    function fetchUpdateKraken() {
      setIsKrakenLoading(true);
      fetch(
        "https://7tj23qrgl1.execute-api.us-east-2.amazonaws.com/test/moves?market=kraken",
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
        setIsKrakenLoading(false);
        if (krakenItems !== undefined) {
          setKrakenItems(addIdsToRows(data));
        }
      });
    }
  
    function onInterval() {
      fetchUpdateStock();
      fetchUpdateBinance();
      fetchUpdateKraken();
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
      fetchUpdateBinance();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
      
    useEffect(() => {
      fetchUpdateKraken();
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
        
    const defaultFilterValue = [
      { name: 'symbol', operator: 'eq', type: 'select', value: null },
      { name: 'window_size_minutes', operator: 'eq', type: 'select', value: null },
      { name: 'threshold', operator: 'eq', type: 'select', value: null },
      { name: 'type_str', operator: 'eq', type: 'select', value: null }
    ];

    const [stockColumns, setStockColumns] = useState(baseColumns);
    const [binanceColumns, setBinanceColumns] = useState(baseColumns);
    const [krakenColumns, setKrakenColumns] = useState(baseColumns);

    useEffect(() => {
      setStockColumns(getColumn(stockItems))
    }, [stockItems]); // eslint-disable-line react-hooks/exhaustive-deps
      
    useEffect(() => {
      setBinanceColumns(getColumn(binanceItems))
    }, [binanceItems]); // eslint-disable-line react-hooks/exhaustive-deps
  
    useEffect(() => {
      setKrakenColumns(getColumn(krakenItems))
    }, [krakenItems]); // eslint-disable-line react-hooks/exhaustive-deps
  
    return (
      <Container className="container-datagrid d-xxl-flex mt-5">
        <Styles>
          <Tabs>
            <TabList>
              <Tab>Stock</Tab>
              <Tab>Binance</Tab>
              <Tab>Kraken</Tab>
            </TabList>
        
            <div>
              { isStockLoading || isCryptoLoading || isKrakenLoading ? <Loading /> : null }
              { error ? <Error />  : null }
              { isLoaded? <IsLoaded /> : null }
            </div>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={stockColumns}
                    dataSource={stockItems}
                    renderRowDetails={renderRowDetails}
                    style={gridStyle}
                    defaultFilterValue={defaultFilterValue}
                    rowExpandHeight={400}
                    defaultGroupBy={['date']}
                    showZebraRows={false}
                />
            </TabPanel>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={binanceColumns}
                    dataSource={binanceItems}
                    renderRowDetails={renderRowDetails}
                    style={gridStyle}
                    defaultFilterValue={defaultFilterValue}
                    rowExpandHeight={400}
                    defaultGroupBy={['date']}
                    showZebraRows={false}
                />
            </TabPanel>
            <TabPanel>
                <ReactDataGrid
                    idProperty="id"
                    columns={krakenColumns}
                    dataSource={krakenItems}
                    renderRowDetails={renderRowDetails}
                    style={gridStyle}
                    defaultFilterValue={defaultFilterValue}
                    rowExpandHeight={400}
                    defaultGroupBy={['date']}
                    showZebraRows={false}
                />
            </TabPanel>
          </Tabs>
        </Styles>
      </Container>
    );
  }
  
export default SignalDataGrid;
