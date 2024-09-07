import { CommonGet, CommonPost } from '../../helpers/HttpClient';
import tokenDecoder from '../../utils/tokenDecoder';

export default {

    getfactoriesForDropDown,
    getGroupsForDropdown,
    getFactoriesByGroupID,
    getAllFactories,
    getVehicleDetailByFactoryID,
    getVehicleTypeByFactoryID,
    updateVehicleDetail,
    saveVehicleDetail,
    GetVehicleDetailsByVehicleID
};

async function getAllFactories() {
    var factoryArray = [];
    const response = await CommonGet('/api/Factory/GetAllFactories', null);
    for (let item of Object.entries(response.data)) {
        factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
    }
    return factoryArray;
}

async function getFactoriesByGroupID(groupID) {
    var factoryArray = [];
    const response = await CommonGet('/api/Group/GetFactoryByGroupID', "groupID=" + parseInt(groupID));
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] == true) {
            factoryArray[item[1]["factoryID"]] = item[1]["factoryName"];
        }
    }
    return factoryArray;
}

async function getfactoriesForDropDown(groupID) {
    var factoryArray = [];

    const response = await CommonGet('/api/Group/GetFactoryByGroupID', 'groupID=' + groupID)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] == true) {
            factoryArray[item[1]["factoryID"]] = item[1]["factoryName"]
        }
    }
    return factoryArray;
}
async function getGroupsForDropdown() {
    var groupArray = [];
    const response = await CommonGet('/api/Group/GetAllGroups', null)
    for (let item of Object.entries(response.data)) {
        if (item[1]["isActive"] === true) {
            groupArray[item[1]["groupID"]] = item[1]["groupName"]
        }
    }
    return groupArray;
}
async function getVehicleDetailByFactoryID(factoryID) {
    const response = await CommonGet('/api/VehicleRegistration/GetVehicleDetailByFactoryID', "factoryID=" + parseInt(factoryID));
    return response.data;
}
async function getVehicleTypeByFactoryID(factoryID) {
    const response = await CommonGet('/api/VehicleRegistration/GetVehicleTypeByFactoryID', "factoryID=" + parseInt(factoryID));
    let VehicleTypeArray = []
    for (let item of Object.entries(response.data)) {
        VehicleTypeArray[item[1]["vehicleTypeID"]] = item[1]["vehicleType"]
    }
    return VehicleTypeArray;
}
async function updateVehicleDetail(Vehicle) {
    let updateModel = {
        vehicleID: parseInt(Vehicle.vehicleID),
        factoryID: parseInt(Vehicle.factoryID),
        groupID: parseInt(Vehicle.groupID),
        vehicleTypeID: parseInt(Vehicle.vehicleTypeID),
        vehicleNumber: Vehicle.vehicleNumber,
        fuelTypeID: parseInt(Vehicle.fuelTypeID),
        capacity: parseFloat(parseFloat(Vehicle.capacity).toFixed(2).toString()),
        isActive: true,
        modifiedBy: tokenDecoder.getUserIDFromToken(),
        modifiedDate: new Date().toISOString(),
    }
    const response = await CommonPost('/api/VehicleRegistration/UpdateVehicle', null, updateModel);
    return response;
}
async function saveVehicleDetail(values) {
    let saveModel = {
        vehicleID: isNaN(parseInt(values.vehicleID)) ? null : parseInt(values.vehicleID),
        factoryID: parseInt(values.factoryID),
        groupID: parseInt(values.groupID),
        vehicleTypeID: parseInt(values.vehicleTypeID),
        vehicleNumber: values.vehicleNumber,
        fuelTypeID: parseInt(values.fuelTypeID),
        capacity: parseFloat(parseFloat(values.capacity).toFixed(2).toString()),
        isActive: true,
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        createdDate: new Date().toISOString()
    }
    const response = await CommonPost('/api/VehicleRegistration/SaveVehicle', null, saveModel);
    return response;
}
async function GetVehicleDetailsByVehicleID(vehicleID) {
    const response = await CommonGet('/api/VehicleRegistration/GetVehicleDetailsByVehicleID', "vehicleID=" + parseInt(vehicleID));
    return response.data;
}





