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
        // Parsing input of transaction:
        // First 64 hex digits (after 10) is address of recipient
        const _to = "0x" + tx.input.substring(10, 10+64).substring(24).toLowerCase();
        // Next 64 hex digits is amount of token sent
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
    
    // TODO: skip ERC-721 transferMethod
    const transferFromMethod = (account, tx, token, listOfTransactions, setListOfTransactions) => {
        // Parsing input of transaction:
        // First 64 hex digits (after 10) is address of sender
        const _from = "0x" + tx.input.substring(10, 10+64).substring(24).toLowerCase();
        // Next 64 hex digits is address of recipient
        const _to = "0x" + tx.input.substring(10+64, 10+64+64).substring(24).toLowerCase();
        // Last 64 hex digits is amount of token sent  
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
            // Searching for keccak of Transfer(address from, address to, uint256 value)
            // log.topics[0] is keccak hash of function
            if(log.topics[0] === ERC20TransferKeccak){
                
                // log.topics[1] is first argument of given function
                let _from = "0x" + log.topics[1].substring(26).toLowerCase();

                // log.topics[2] is second argument of given function
                let _to = "0x" + log.topics[2].substring(26).toLowerCase();
            
                if((account !== _from) && (account !== _to))
                    continue;

                // Address of token transfered
                let token = log.address.toLowerCase();

                // Amount of tokens transfered
                let amount = log.data
                
                // eslint-disable-next-line
                setListOfTransactions(listOfTransactions => [
                    ...listOfTransactions,
                    createData(
                        rowNumber++,
                        txHash,
                        _from,
                        _to,
                        Token[token] !== undefined ? web3.utils.fromWei(amount, parseDecimals(Token[token].decimals)) : web3.utils.fromWei(amount, "ether"),
                        Token[token] !== undefined ? Token[token].name : token
                    )
                ]);  
            }
        }
    };

    const searchTransaction = async(tx, account, listOfTransactions, setListOfTransactions) => {
        const fromAccount = tx.from.toLowerCase();
        const toAccount = (tx.to === null) ? null : tx.to.toLowerCase();

        // If transaction have input field then check first 4 bytes (8 hex characters). This hex value is
        // derived from taking the method name and its argument types, taking keccak hash of the result.
        if(tx.input !== "0x" && toAccount !== null){
            if(tx.input.startsWith(TRANSFER_METHOD))
		        transferMethod(account, tx, fromAccount, toAccount, listOfTransactions, setListOfTransactions);
		    else if(tx.input.startsWith(TRANSFER_FROM_METHOD))
			    transferFromMethod(account, tx, toAccount, listOfTransactions, setListOfTransactions);
            else if(tx.input.startsWith(MULTICALL_METHOD))
                multicallMethod(account, tx.hash, listOfTransactions, setListOfTransactions);
        }

        const value = web3.utils.fromWei(tx.value, "ether");

        if(value === "0")
            return;
    
        // If value of ETH in current transaction is not 0, check if input address matches from/to fields
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
   
        // End of recursion
        if(block === null){
            rowNumber = 0;
            setCanSearch(true);
            setBlockNumber(0);
            return;
        }

        // Search every transaction in this block
        for(let tx of block.transactions)
            searchTransaction(tx, address.toLowerCase(), listOfTransactions, setListOfTransactions);

        // Recursive call for next block
        setBlockNumber(n++);
        getBlockByNumber(setListOfTransactions, setBlockNumber, setCanSearch, n, address, listOfTransactions);
    };

    return {getBlockByNumber};
};

export default Web3Functions;