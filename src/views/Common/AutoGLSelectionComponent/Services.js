import { CommonGet, CommonGetAxios, CommonPost } from './../../../helpers/HttpClient';
import { tokenDecoder } from 'src/utils/tokenDecoder';

export default {
    GetLedgerAccountDetailsByTransactionID
};

async function GetLedgerAccountDetailsByTransactionID(transactionTypeID, groupID, factoryID) {
    const response = await CommonGet('/api/GLMapping/GetCreditDebitGLAccountsForTransation', "transactionTypeID=" + parseInt(transactionTypeID) + "&groupID=" + parseInt(groupID) + "&factoryID=" + parseInt(factoryID));
    return response;
}
