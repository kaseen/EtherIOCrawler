import {makeStyles} from "@material-ui/core";

export const UseStyles = makeStyles(() => ({
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
        minWidth: 1900,
        maxWidth: 1900,
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
}));

export default UseStyles;