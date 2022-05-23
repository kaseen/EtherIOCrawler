import Web3 from "web3";
import Token from "../dependencies/tokens.json";
import {TRANSFER_METHOD, TRANSFER_FROM_METHOD, MULTICALL_METHOD, ERC20TransferKeccak} from "../dependencies/hashes.js";

let rowNumber = 0;

export const Web3Functions = () => {
      
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`));

    const createData = (rowNumber, txHash, from, to, value, token) => {
        return {rowNumber, txHash, from, to, value, token};
    };

    const parseDecimals = (decimals) => {
        decimals += 1;
        switch(decimals){
            case 4:
                return "kwei";
            case 7:
                return "mwei";
            case 10:
                return "gwei";
            case 13:
                return "microether";
            default:
                return "ether";
        }
    }

    const transferMethod = (account, tx, from, token, listOfTransactions, setListOfTransactions) => {
        const _to = "0x" + tx.input.substring(10, 10+64).substring(24).toLowerCase();
        const _value = tx.input.substring(10+64, 10+64+64);

        if((account !== from) && (account !== _to))
            return;

        setListOfTransactions(listOfTransactions => [
            ...listOfTransactions, 
            createData(
                rowNumber++,
                tx.hash,
                from,
                _to,
                Token[token] !== undefined ? web3.utils.fromWei(_value, parseDecimals(Token[token].decimals)) : web3.utils.fromWei(_value, "ether"), 
                Token[token] !== undefined ? Token[token].name : token
            )
        ]);
    };
    
    const transferFromMethod = (account, tx, token, listOfTransactions, setListOfTransactions) => {
        const _from = "0x" + tx.input.substring(10, 10+64).substring(24).toLowerCase();
        const _to = "0x" + tx.input.substring(10+64, 10+64+64).substring(24).toLowerCase();
        const _value = tx.input.substring(10+64+64, 10+64+64+64);

        if((account !== _from) && (account !== _to))
            return;

        setListOfTransactions(listOfTransactions => [
            ...listOfTransactions, 
            createData(
                rowNumber++,
                tx.hash,
                _from,
                _to,
                Token[token] !== undefined ? web3.utils.fromWei(_value, parseDecimals(Token[token].decimals)) : web3.utils.fromWei(_value, "ether"),
                Token[token] !== undefined ? Token[token].name : token
            )
        ]);
    };

    const multicallMethod = async(account, txHash, listOfTransactions, setListOfTransactions) => {
        const x = await web3.eth.getTransactionReceipt(txHash);
        
        for(const log of x.logs){
            if(log.topics[0] === ERC20TransferKeccak){
                let _from = "0x" + log.topics[1].substring(26).toLowerCase();
                let _to = "0x" + log.topics[2].substring(26).toLowerCase();
                let token = log.address.toLowerCase();
            
                if((account !== _from) && (account !== _to))
                    continue;
                
                // eslint-disable-next-line
                setListOfTransactions(listOfTransactions => [
                    ...listOfTransactions,
                    createData(
                        rowNumber++,
                        txHash,
                        _from,
                        _to,
                        Token[token] !== undefined ? web3.utils.fromWei(log.data, parseDecimals(Token[token].decimals)) : web3.utils.fromWei(log.data, "ether"),
                        Token[token] !== undefined ? Token[token].name : token
                    )
                ]);  
            }
        }
    };

    const searchTransaction = async(tx, account, listOfTransactions, setListOfTransactions) => {
        const fromAccount = tx.from.toLowerCase();
        const toAccount = (tx.to === null) ? null : tx.to.toLowerCase();

        if(tx.input !== "0x" && toAccount !== null)
            if(tx.input.startsWith(TRANSFER_METHOD))
		        transferMethod(account, tx, fromAccount, toAccount, listOfTransactions, setListOfTransactions);
		    else if(tx.input.startsWith(TRANSFER_FROM_METHOD))
			    transferFromMethod(account, tx, toAccount, listOfTransactions, setListOfTransactions);
            else if(tx.input.startsWith(MULTICALL_METHOD))
                multicallMethod(account, tx.hash, listOfTransactions, setListOfTransactions);

        const value = web3.utils.fromWei(tx.value, "ether");

        if(value === "0")
            return;
    
        if(fromAccount === account)
            setListOfTransactions(listOfTransactions => [
                ...listOfTransactions, 
                createData(rowNumber++, tx.hash, account, toAccount, value, "ETH")
            ]);
    
        else if(toAccount !== null && toAccount === account)
            setListOfTransactions(listOfTransactions => [
                ...listOfTransactions, 
                createData(rowNumber++, tx.hash, fromAccount, account, value, "ETH")
            ]);        
    };

    const getBlockByNumber = async(setListOfTransactions, setBlockNumber, setCanSearch, n, address, listOfTransactions) => {
        const block = await web3.eth.getBlock(n, true);
   
        if(block === null){
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