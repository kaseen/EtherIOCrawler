import Web3 from "web3";
import Token from "../dependencies/tokens.json";

const TRANSFER_METHOD = "0xa9059cbb";
const TRANSFER_FROM_METHOD = "0x23b872dd";

let rowNumber = 0;

export const Web3Functions = () => {

    const networksMap = [
        {key: 1, value: "mainnet"}, 
        {key: 4, value: "rinkeby"},
        {key: 42, value: "kovan"}
    ]
      
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://${networksMap[0].value}.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`));

    const createData = (rowNumber, txHash, from, to, value, token) => {
        return {rowNumber, txHash, from, to, value, token};
    };

    const transferMethod = (account, tx, from, token, listOfTransactions, setListOfTransactions) => {
        const _to = "0x" + tx.input.substring(10, 10+64).substring(24);
        const _value = tx.input.substring(10+64, 10+64+64);

        if((account !== from.toLowerCase()) && (account !== _to.toLowerCase()))
            return;

        setListOfTransactions(listOfTransactions => [
            ...listOfTransactions, 
            createData(
                rowNumber++,
                tx.hash,
                from,
                _to,
                Token[token] !== undefined ? web3.utils.fromWei(_value, "mwei") : web3.utils.fromWei(_value, "ether"), 
                Token[token] !== undefined ? Token[token].name : token
            )
        ]);
    }
    
    const transferFromMethod = (account, tx, token, listOfTransactions, setListOfTransactions) => {
        const _from = "0x" + tx.input.substring(10, 10+64).substring(24);
        const _to = "0x" + tx.input.substring(10+64, 10+64+64).substring(24);
        const _value = tx.input.substring(10+64+64, 10+64+64+64);

        if((account !== _from.toLowerCase()) && (account !== _to.toLowerCase()))
            return;

        setListOfTransactions(listOfTransactions => [
            ...listOfTransactions, 
            createData(
                rowNumber++,
                tx.hash,
                _from,
                _to,
                Token[token] !== undefined ? web3.utils.fromWei(_value, "mwei") : web3.utils.fromWei(_value, "ether"), 
                Token[token] !== undefined ? Token[token].name : token
            )
        ]);
    }

    const searchTransaction = async(tx, account, listOfTransactions, setListOfTransactions) => {
        const fromAccount = tx.from.toLowerCase();
        const toAccount = (tx.to === null) ? null : tx.to.toLowerCase();

        if(tx.input !== "0x" && toAccount !== null){
            if(tx.input.startsWith(TRANSFER_METHOD))
			    transferMethod(account, tx, fromAccount, toAccount, listOfTransactions, setListOfTransactions);
		    else if(tx.input.startsWith(TRANSFER_FROM_METHOD))
			    transferFromMethod(account, tx, toAccount, listOfTransactions, setListOfTransactions);
        }

        const value = web3.utils.fromWei(tx.value, "ether");
        if(value === "0")
            return;
    
        if(fromAccount === account)
            setListOfTransactions(listOfTransactions => [
                ...listOfTransactions, 
                createData(rowNumber++, tx.hash, account, toAccount, value, "Ether")
            ]);
    
    
        else if(toAccount !== null && toAccount === account)
            setListOfTransactions(listOfTransactions => [
                ...listOfTransactions, 
                createData(rowNumber++, tx.hash, fromAccount, account, value, "Ether")
            ]);        
    };

    const getBlockByNumber = async(setListOfTransactions, setBlockNumber, setCanSearch, n, address, listOfTransactions) => {
        const block = await web3.eth.getBlock(n, true);
   
        if(block === null || n === 14823350){
            rowNumber = 0;
            setCanSearch(true);
            setBlockNumber(0);
            return;
        }

        for(let tx of block.transactions)
            searchTransaction(tx, address.toLowerCase(), listOfTransactions, setListOfTransactions);

        setBlockNumber(n++);
        getBlockByNumber(setListOfTransactions, setBlockNumber, setCanSearch, n, address, listOfTransactions);
    };

    return {getBlockByNumber};
};

export default Web3Functions;