import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {
  GetAllProducts,
  saveProduct,
  getProductDetailsByID,
  updateProduct
};

async function GetAllProducts() {
  const response = await CommonGet('/api/Product/GetAllProductsForProductScreen', null);
  return response.data;
}

async function saveProduct(product) {

  let saveModel = {
    productID: 0,
    productName: product.productName,
    productCode: product.productCode,
    productDescription: product.productDescription,
    isActive: product.isActive,
    createdBy: 0,
    createdDate: new Date().toISOString(),

  }

  const response = await CommonPost('/api/Product/SaveProduct', null, saveModel);
  return response;
}

async function updateProduct(product) {

  let updateModel = {
    productID: parseInt(product.productID),
    productName: product.productName,
    productCode: product.productCode,
    productDescription: product.productDescription,
    isActive: product.isActive,
    modifiedBy: 0,
    modifiedDate: new Date().toISOString(),

  }
  const response = await CommonPost('/api/Product/UpdateProduct', null, updateModel);
  return response;
}

async function getProductDetailsByID(productID) {
  const response = await CommonGet('/api/Product/getProductDetailsByID', "productID=" + parseInt(productID));
  return response.data;
}
