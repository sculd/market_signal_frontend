var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _templateObject = _taggedTemplateLiteral(["\n  padding: 1rem;\n\n  table {\n    border-spacing: 0;\n    border: 1px solid black;\n\n    tr {\n      :last-child {\n        td {\n          border-bottom: 0;\n        }\n      }\n    }\n\n    th,\n    td {\n      margin: 0;\n      padding: 0.5rem;\n      border-bottom: 1px solid black;\n      border-right: 1px solid black;\n\n      :last-child {\n        border-right: 0;\n      }\n    }\n  }\n"], ["\n  padding: 1rem;\n\n  table {\n    border-spacing: 0;\n    border: 1px solid black;\n\n    tr {\n      :last-child {\n        td {\n          border-bottom: 0;\n        }\n      }\n    }\n\n    th,\n    td {\n      margin: 0;\n      padding: 0.5rem;\n      border-bottom: 1px solid black;\n      border-right: 1px solid black;\n\n      :last-child {\n        border-right: 0;\n      }\n    }\n  }\n"]);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { useTable } from "react-table";

import makeData from "./makeData";

var Styles = styled.div(_templateObject);

function Table(_ref) {
  var columns = _ref.columns,
      data = _ref.data;

  // Use the state and functions returned from useTable to build your UI
  var _useTable = useTable({
    columns: columns,
    data: data
  }),
      getTableProps = _useTable.getTableProps,
      getTableBodyProps = _useTable.getTableBodyProps,
      headerGroups = _useTable.headerGroups,
      rows = _useTable.rows,
      prepareRow = _useTable.prepareRow;

  // Render the UI for your table


  return React.createElement(
    "table",
    getTableProps(),
    React.createElement(
      "thead",
      null,
      headerGroups.map(function (headerGroup) {
        return React.createElement(
          "tr",
          headerGroup.getHeaderGroupProps(),
          headerGroup.headers.map(function (column) {
            return React.createElement(
              "th",
              column.getHeaderProps(),
              column.render("Header")
            );
          })
        );
      })
    ),
    React.createElement(
      "tbody",
      getTableBodyProps(),
      rows.map(function (row, i) {
        prepareRow(row);
        return React.createElement(
          "tr",
          row.getRowProps(),
          row.cells.map(function (cell) {
            return React.createElement(
              "td",
              cell.getCellProps(),
              cell.render("Cell")
            );
          })
        );
      })
    )
  );
}

function App() {
  var columns = React.useMemo(function () {
    return [{
      Header: "Name",
      columns: [{
        Header: "Date",
        accessor: "date"
      }, {
        Header: "Datetime",
        accessor: "datetime_et"
      }]
    }, {
      Header: "Info",
      columns: [{
        Header: "Symbol",
        accessor: "symbol"
      }, {
        Header: "Price",
        accessor: "close"
      }, {
        Header: "Jump",
        accessor: "max_jump"
      }, {
        Header: "Drop",
        accessor: "min_drop"
      }]
    }];
  }, []);

  var testResults = [{
    close: "36.085",
    date: "2021-03-26",
    datetime: "2021-03-26T04:26:01-0400",
    datetime_et: "2021-03-26 00:26:01.399688-04:00",
    max_jump: 0.146,
    min_drop: 0.0,
    symbol: "BTCSTUSDT",
    window_size_minutes: 10
  }, {
    close: "36.108",
    date: "2021-03-26",
    datetime: "2021-03-26T04:26:14-0400",
    datetime_et: "2021-03-26 00:26:14.809617-04:00",
    max_jump: 0.149,
    min_drop: 0.0,
    symbol: "BTCSTBUSD",
    window_size_minutes: 10
  }];

  var data = React.useMemo(function () {
    return testResults;
  }, []);

  var _useState = useState(null),
      _useState2 = _slicedToArray(_useState, 2),
      error = _useState2[0],
      setError = _useState2[1];

  var _useState3 = useState(false),
      _useState4 = _slicedToArray(_useState3, 2),
      isLoaded = _useState4[0],
      setIsLoaded = _useState4[1];

  var _useState5 = useState([]),
      _useState6 = _slicedToArray(_useState5, 2),
      items = _useState6[0],
      setItems = _useState6[1];

  useEffect(function () {
    fetch("https://7tj23qrgl1.execute-api.us-east-2.amazonaws.com/test/moves/", {
      method: "get",
      headers: new Headers({
        "x-api-key": process.env.REACT_APP_API_GATEWAY_API_KEY
      })
    }).then(function (response) {
      return response.json();
    }, function (error) {
      setIsLoaded(true);
      setError(error);
    }).then(function (data) {
      setIsLoaded(true);
      setItems(data);
      console.log(data.slice(1, 10));
    });
  }, []);

  return React.createElement(
    Styles,
    null,
    React.createElement(Table, { columns: columns, data: items })
  );
}

export default App;