import React from "react";
import {Box, Button, TextField} from "@material-ui/core";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {useEffect, useState} from "react";
import TablePagination from '@mui/material/TablePagination';
import {Web3Functions} from "../hooks/hookWeb3"
import {UseStyles} from "./styles/useStyles"


export const Main = () => {

    const classes = UseStyles();
    const [address, setAddress] = useState();
    const [blockNumber, setBlockNumber] = useState(0);
    const [result, setResult] = useState(0);
    const [listOfTransactions, setListOfTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [show, setShow] = useState(false);
    const [canSearch, setCanSearch] = useState(true);

    const blockRef = React.useRef(null);
    const addressRef = React.useRef(null);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, listOfTransactions.length - page * rowsPerPage);

    const hook = Web3Functions();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const searchButtonOnClick = () => {
        blockRef.current.value = "";
        addressRef.current.value = "";
        setShow(true);
        setCanSearch(false);
        hook.getBlockByNumber(setListOfTransactions, setBlockNumber, setCanSearch, blockNumber, address, listOfTransactions);
        setListOfTransactions([]);
    };
    
    useEffect(() => {
        setResult(listOfTransactions.length);
    }, [listOfTransactions]);

    return(
        <Box className={classes.wrapper}>
            <Box className={classes.box}>
                <TextField
                    id="blockNumber"
                    inputRef={blockRef}
                    helperText="Enter block number"
                    variant="outlined"
                    size="small"
                    disabled={!canSearch}
                    onChange={input => {
                        setShow(false);
                        setBlockNumber(Number(input.target.value));
                    }}
                />
                <TextField
                    id="accountAddress"
                    inputRef={addressRef}
                    helperText="Enter account address"
                    variant="outlined"
                    size="small"
                    disabled={!canSearch}
                    onChange={input => {
                        setShow(false);
                        setAddress(input.target.value.toLowerCase().toString());
                    }}
                />
                <Button className={classes.button} disabled={!canSearch} onClick={searchButtonOnClick}>Search</Button>
            </Box>
            <Box className={classes.searchResult}>
                {show === true ? blockNumber !== 0 ? "Currently searching in block no. " + blockNumber : "Total of " + result + " transactions." : null}
            </Box>
            <Box>
                <TableContainer className={classes.table}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width="30%" align="center"><b>Transaction</b></TableCell>
                                <TableCell width="20%" align="center"><b>From</b></TableCell>
                                <TableCell width="20%" align="center"><b>To</b></TableCell>
                                <TableCell width="10%" align="center"><b>Value</b></TableCell>
                                <TableCell width="20%" align="center"><b>Token</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                            listOfTransactions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.rowNumber}>
                                        <TableCell>{row.txHash}</TableCell>
                                        <TableCell>{row.from}</TableCell>
                                        <TableCell>{row.to}</TableCell>
                                        <TableCell align="right">{row.value}</TableCell>
                                        <TableCell align="right">{row.token}</TableCell>
                                    </TableRow>
                                ))
                            }
                            {
                            emptyRows > 0 && (
                                <TableRow style={{height: 33 * emptyRows}}>
                                    <TableCell colSpan={3}/>
                                </TableRow>
                            )
                            }
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[10,20,50,100]}
                        component="div"
                        count={listOfTransactions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </Box>
        </Box>
    )
};