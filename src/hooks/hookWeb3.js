import Web3 from "web3";

export const Web3Functions = () => {

    const networksMap = [
        {key: 1, value: "mainnet"}, 
        {key: 4, value: "rinkeby"},
        {key: 42, value: "kovan"}
    ]
      
    const web3 = new Web3(new Web3.providers.HttpProvider(`https://${networksMap[0].value}.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`));

    const searchTransaction = async(txHash, account, listOfTransactions, setListOfTransactions) => {
        const tx = await web3.eth.getTransaction(txHash);
      
        const fromAccount = tx.from.toLowerCase();
        const toAccount = (tx.to === null) ? null : tx.to.toLowerCase();
    
        if(fromAccount === account)
            setListOfTransactions(listOfTransactions => [...listOfTransactions, createData(txHash, account, toAccount, web3.utils.fromWei(tx.gasPrice, "ether"))]);
    
        else if(toAccount !== null && toAccount === account)
            setListOfTransactions(listOfTransactions => [...listOfTransactions, createData(txHash, fromAccount, account, web3.utils.fromWei(tx.gasPrice, "ether"))]);   
    }

    function createData(txHash, from, to, value){
        return {txHash, from, to, value};
    }

    const getBlockByNumber = async(n, address, listOfTransactions, setListOfTransactions) => {
        const block = await web3.eth.getBlock(n);
        if(block === null || block.number === 14802820)
            return;

        for(let tx of block.transactions)
            searchTransaction(tx, address.toLowerCase(), listOfTransactions, setListOfTransactions);

        //getBlockByNumber(++n, address, listOfTransactions, setListOfTransactions);
    }

    return {getBlockByNumber};
}

export default Web3Functions;