import Web3 from "web3";

export const Web3Functions = () => {

    const networksMap = [
        {key: 1, value: "mainnet"}, 
        {key: 4, value: "rinkeby"},
        {key: 42, value: "kovan"}
    ]
      
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://${networksMap[0].value}.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`));

    const searchTransaction = async(tx, account, listOfTransactions, setListOfTransactions) => {
        const fromAccount = tx.from.toLowerCase();
        const toAccount = (tx.to === null) ? null : tx.to.toLowerCase();
    
        if(fromAccount === account)
            setListOfTransactions(listOfTransactions => [...listOfTransactions, createData(tx.hash, account, toAccount, web3.utils.fromWei(tx.value, "ether"))]);
    
        else if(toAccount !== null && toAccount === account)
            setListOfTransactions(listOfTransactions => [...listOfTransactions, createData(tx.hash, fromAccount, account, web3.utils.fromWei(tx.value, "ether"))]);   
    };

    const createData = (txHash, from, to, value) => {
        return {txHash, from, to, value};
    };

    const getBlockByNumber = async(setListOfTransactions, setBlockNumber, setCanSearch, n, address, listOfTransactions) => {
        const block = await web3.eth.getBlock(n, true);
   
        if(block === null){
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