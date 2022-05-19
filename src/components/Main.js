import {Box, Button, TextField, makeStyles} from "@material-ui/core";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {useEffect, useState} from "react";
import {Web3Functions} from "../hooks/hookWeb3"

const useStyles = makeStyles(() => ({
    button: {
        backgroundColor: '#F8F8F8',
        borderRadius: '5px',
        marginBottom: '30px'
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
        border: "1px solid black"
    },
    table: {
        minWidth: 1000,
        maxWidth: 1000
    }
}))

export const Main = () => {

    const classes = useStyles();
    const [address, setAddress] = useState("0x33Ddd548FE3a082d753E5fE721a26E1Ab43e3598");
    const [listOfTransactions, setListOfTransactions] = useState([]);

    const hook = Web3Functions()

    // TEST
    // 14802800 -> 14802820
    const testtest = () => {
        hook.getBlockByNumber(14802800, address, listOfTransactions, setListOfTransactions);
    }  
    
    useEffect(() => {
    }, [listOfTransactions])

    return(
        <Box className={classes.wrapper}>
            <Box className={classes.box}>
                <TextField
                    id="blockNumber"
                    label=" "
                    helperText="Enter block number"
                    variant="outlined"
                />
                <TextField
                    id="accountAddress"
                    label=" "
                    helperText="Enter account address"
                    variant="outlined"
                    onChange={input => setAddress(input.target.value)}
                />
            </Box>
            <Box>
                <Button className={classes.button} onClick={testtest}>Search</Button>
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
                            {listOfTransactions.map((row) => (
                                <TableRow key={row.txHash}>
                                    <TableCell>{row.from}</TableCell>
                                    <TableCell>{row.to}</TableCell>
                                    <TableCell>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    )
}