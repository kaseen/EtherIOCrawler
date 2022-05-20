import {Box, Button, TextField, makeStyles} from "@material-ui/core";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {useEffect, useState} from "react";
import {Web3Functions} from "../hooks/hookWeb3"
import TablePagination from '@mui/material/TablePagination';

const useStyles = makeStyles(() => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    box: {
        width: '700px',
        height: '80px',
        display: 'flex',
        marginTop: '15px',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    searchResult:{
        height: '20px',
        width: '500px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: '10px',
        marginBottom: '5px',
    },
    table: {
        minWidth: 1000,
        maxWidth: 1000,
        backgroundColor: 'white',
        borderRadius: '10px',
        border: '1px solid black',
        marginBottom: '10px'
    },
    button: {
        borderRadius: '5px',
        border: '1px solid black',
        marginBottom: '24px'
    }
}))

export const Main = () => {

    const classes = useStyles();
    const [address, setAddress] = useState("0x33Ddd548FE3a082d753E5fE721a26E1Ab43e3598");
    const [blockNumber, setBlockNumber] = useState(0);
    const [show, setShow] = useState(false);
    const [result, setResult] = useState(0);
    const [listOfTransactions, setListOfTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, listOfTransactions.length - page * rowsPerPage);

    const hook = Web3Functions();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // TEST
    // 14802800 -> 14802820
    const searchButtonOnClick = () => {
        setShow(true);
        hook.getBlockByNumber(setListOfTransactions, setBlockNumber, blockNumber, address, listOfTransactions);
        setListOfTransactions([]);
        setBlockNumber(null);
    };
    
    useEffect(() => {
        setResult(listOfTransactions.length);
    }, [listOfTransactions])

    return(
        <Box className={classes.wrapper}>
            <Box className={classes.box}>
                <TextField
                    id="blockNumber"
                    label=" "
                    helperText="Enter block number"
                    variant="outlined"
                    size="small"
                    onChange={input => setBlockNumber(Number(input.target.value))}
                />
                <TextField
                    id="accountAddress"
                    label=" "
                    helperText="Enter account address"
                    variant="outlined"
                    size="small"
                    onChange={input => setAddress(input.target.value)}
                />
                <Button className={classes.button} onClick={searchButtonOnClick}>Search</Button>
            </Box>
            <Box className={classes.searchResult}>
                {show === true ? typeof(blockNumber) === "number" ? "Currently searching in block no. " + blockNumber : "Total of " + result + " transactions." : null}
            </Box>
            <Box>
                <TableContainer className={classes.table}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell width="40%" align="center"><b>From</b></TableCell>
                                <TableCell width="40%" align="center"><b>To</b></TableCell>
                                <TableCell width="20%" align="center"><b>Value (Ether)</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                            listOfTransactions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.txHash}>
                                        <TableCell>{row.from}</TableCell>
                                        <TableCell>{row.to}</TableCell>
                                        <TableCell>{row.value}</TableCell>
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
}