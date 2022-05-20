import {Box, Button, TextField, makeStyles} from "@material-ui/core";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {useEffect, useState} from "react";
import {Web3Functions} from "../hooks/hookWeb3"
import TablePagination from '@mui/material/TablePagination';

const useStyles = makeStyles(() => ({
    button: {
        backgroundColor: '#e66465',
        borderRadius: '5px',
        border: '1px solid black',
        marginTop: '20px',
        marginBottom: '15px'
    },
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    box: {
        padding: '40px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '30px',
        marginBottom: '30px',
        border: '1px solid black'
    },
    searchResult:{
        height: '150px',
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '30px',
        border: '1px solid black'
    },
    table: {
        minWidth: 1000,
        maxWidth: 1000,
        height: '800px'
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
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, listOfTransactions.length - page * rowsPerPage);

    const hook = Web3Functions();

    // TEST
    // 14802800 -> 14802820
    const searchButtonOnClick = () => {
        setShow(true);
        // TODO: setListOfTransactions([]);
        hook.getBlockByNumber(setListOfTransactions, setBlockNumber, blockNumber, address, listOfTransactions);
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
                    onChange={input => setBlockNumber(Number(input.target.value))}
                />
                <TextField
                    id="accountAddress"
                    label=" "
                    helperText="Enter account address"
                    variant="outlined"
                    onChange={input => setAddress(input.target.value)}
                />
            </Box>
            <Box className={classes.searchResult}>
                <Button className={classes.button} onClick={searchButtonOnClick}>Search</Button>
                <Box style={{height: '20%', textAlign: 'center', marginBottom: '10px'}}>
                    {show === true ? typeof(blockNumber) === "number" ? "Currently searching in block no. " + blockNumber : null : null}
                    {typeof(blockNumber) !== "number" ? "Finished" : null}
                </Box>
                {result}
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
                        rowsPerPageOptions={[5,10,25]}
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