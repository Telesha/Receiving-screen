import React, { useState, useEffect, useRef } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Box,
  Card,
  Button,
  makeStyles,
  Container,
  Divider,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  MenuItem,
  Switch,
  InputLabel,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@material-ui/core';
import Page from 'src/components/Page';
import services from '../Services';
import { Formik } from 'formik';
import * as Yup from "yup";
import { useAlert } from "react-alert";
import { Fragment } from 'react';
import { LoadingComponent } from '../../../utils/newLoader';
import { trackPromise } from 'react-promise-tracker';
import tokenDecoder from '../../../utils/tokenDecoder';
import authService from '../../../utils/permissionAuth';
import { useNavigate, useParams } from 'react-router-dom';
import tokenService from '../../../utils/tokenDecoder';
import _ from 'lodash';
import PageHeader from 'src/views/Common/PageHeader';
import moment from 'moment';
import MaterialTable from "material-table";


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  row: {
    marginTop: '1rem'
  }
}));

const screenCode = 'ATTENDANCEPLUCKING';

export default function DailyCheckRollAdd(props) {
  const alert = useAlert();
  const classes = useStyles();
  const [FormDetails, setFormDetails] = useState({
    groupID: '0',
    estateID: '0',
    mainDivisionID: '0',
    divisionID: '0',
    collectedDate: new Date().toISOString().substring(0, 10),
    jobTypeID: '0',
    employeeTypeID: '0',
    employeeNumber: null,
    workTypeID: '0',
    fieldID: '0',
    gangID: '0',
    sessionID: '0',
    amount: 0,
    days: '0',
    norm: 0,
    minNoam: 0,
    isActive: false,
    isHoliday: false,
    musterChitID: '0',
    operatorID: '0',
    empName: "",
    lentEstateID: '0'
  });
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [estates, setEstates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [JobTypes, setJobTypes] = useState([]);
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [amount, setAmount] = useState('');
  const [fieldsForDropdown, setFieldsForDropDown] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [musterChitList, setMusterChitList] = useState([]);
  const [gangs, setGangs] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [title, setTitle] = useState("Attendance - Plucking")
  const [overKilo, setOverKilo] = useState(0);
  const [daysValue, setDaysValue] = useState('0');
  const [days, setDay] = useState();
  const [lentEstateName, setLentEstateName] = useState()
  const [employeeTypeCheck, setEmployeeTypeCheck] = useState(0);
  const [employeeGenderID, setEmployeeGenderID] = useState(0);
  const [operators, setOperators] = useState([]);
  const [attendenceData, setAttendenceData] = useState([]);
  const [attendenceRowData, setAttendenceRowData] = useState([])
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [enterBtnConfirm, setEnterBtnConfirm] = useState(false)
  const [attendenceCount, setAttendenceCount] = useState(0)
  const [musterCount, SetMusterCount] = useState(0)
  const [totalKg, SetTotalKg] = useState(0)
  const [jobTypeMuster, setJobTypeMuster] = useState(0)
  const [attendenceCashCount, setAttendenceCashCount] = useState(0)
  const [totalOverKg, SetTotalOverKg] = useState(0)
  const [empName, setEmpName] = useState('')
  const [employeeID, setEmployeeID] = useState('')
  const [permissionList, setPermissions] = useState({
    isGroupFilterEnabled: false,
    isFactoryFilterEnabled: false
  });
  const [addingSuccess, setAddingSuccess] = useState(false)
  const { employeeAttendanceID } = useParams();
  const empNoRef = useRef(null)
  const amountRef = useRef(null)
  const addButtonRef = useRef(null)
  const enterBtnRef = useRef(null)
  const currentDate = new Date();
  const maxDate = currentDate.toISOString().split('T')[0];
  const [minDate, setMinDate] = useState(new Date(currentDate));
  const minDateString = minDate.toISOString().split('T')[0];
  let decrypted = 0;

  useEffect(() => {
    decrypted = atob(employeeAttendanceID.toString());
    if (decrypted != 0) {
      trackPromise(getPluckingAttendanceDetailsByAttendanceID(decrypted));
    }
    trackPromise(getAllGroups(), getPermissions(), getJobTypesForDropDown(), getOperatorsForDropdown());
  }, []);

  useEffect(() => {
    setFormDetails({
      ...FormDetails,
      sessionID: '4'
    })
  }, [FormDetails.groupID])

  useEffect(() => {
    if (FormDetails.groupID > 0) {
      trackPromise(getEstateDetailsByGroupID());
    };
  }, [FormDetails.groupID]);

  useEffect(() => {
    if (FormDetails.estateID > '0') {
      trackPromise(
        getDivisionDetailsByEstateID())
    };
  }, [FormDetails.estateID]);

  useEffect(() => {
    if (FormDetails.estateID > '0' && FormDetails.fieldID !== '0' && employeeGenderID !== 0 && !isUpdate) {
      trackPromise(
        getNormValueByEstateID());
    };
  }, [employeeGenderID, employeeNumber]);

  useEffect(() => {
    if (FormDetails.divisionID > 0) {
      trackPromise(
        getGangDetailsByDivisionID(),
        getFieldDetailsByDivisionIDForDropdown(),
        getEmployeeTypesForDropdown());
    };
  }, [FormDetails.divisionID]);

  useEffect(() => {
    if (FormDetails.mainDivisionID > 0) {
      trackPromise(
        getAttendanceExecutionDate());
    };
  }, [FormDetails.mainDivisionID]);

  useEffect(() => {
    setEmployeeTypeCheck(0)
  }, [employeeNumber]);

  useEffect(() => {
    if (employeeNumber > 0 || employeeNumber != "") {
      trackPromise(getDailyCheckRollDetail());
      getEmployeeTypesForDropdown();
    }
  }, [employeeNumber]);

  useEffect(() => {
    trackPromise(calOverKilo());
  }, [FormDetails.days, amount, FormDetails.isHoliday]);

  useEffect(() => {
    if (isUpdate) {
      trackPromise(calOverKilo());
    }
  }, []);

  useEffect(() => {
    checkDayType();
  }, [FormDetails.noam, amount]);

  useEffect(() => {
    trackPromise(clearDays());
  }, [FormDetails.isActive === false]);

  useEffect(() => {
    if (!isUpdate) {
      setFormDetails({
        ...FormDetails,
        musterChitID: '0',
        divisionID: '0',
        fieldID: '0',
        workTypeID: '0',
        jobTypeID: '0',
        empName: ''
      });
      setEmployeeNumber('');
      setAmount('');
      setEmpName('');
      setEmployeeID('');
    }
    if (FormDetails.mainDivisionID > '0') {
      trackPromise(getMusterChitDetailsByDateDivisionID());
    };

  }, [FormDetails.mainDivisionID, FormDetails.collectedDate]);

  useEffect(() => {
    if (!isUpdate) {
      setFormDetails({
        ...FormDetails,
        musterChitID: '0',
        divisionID: '0',
        fieldID: '0',
        workTypeID: '0',
        jobTypeID: '0',
        empName: ''
      });
      setEmployeeNumber('');
      setAmount('');
      setEmpName('');
      setEmployeeID('');
    }
  }, [FormDetails.musterChitID]);

  useEffect(() => {
    if (FormDetails.musterChitID > '0' && !isUpdate) {
      trackPromise(getMusterchitDetailsByMusterchitID());
      setFormDetails({
        norm: 0
      })
    }
  }, [FormDetails.musterChitID]);

  useEffect(() => {
    if (isUpdate) {
      trackPromise(getMusterchitDetailsByMusterchitIDForUpdate());
    }
  }, [FormDetails.musterChitID]);

  useEffect(() => {
    if (FormDetails.jobTypeID !== '3' && isUpdate == false) {
      setFormDetails({
        ...FormDetails,
        days: '0',
        isActive: false
      });
      setOverKilo(0)
    }
  }, [FormDetails.jobTypeID]);

  useEffect(() => {
    if (!isUpdate) {
      setAmount('')
    }
  }, [employeeNumber]);

  useEffect(() => {
    if (!isUpdate) {
      setFormDetails({
        ...FormDetails,
        days: '0',
        isActive: false,
        isHoliday: false
      });
    }
  }, [amount, employeeNumber, FormDetails.musterChitID]);

  useEffect(() => {
    setFormDetails({
      ...FormDetails,
      days: daysValue
    });
  }, [daysValue, amount]);

  useEffect(() => {
    if (employeeNumber !== "") {
      if (!isUpdate) {
        setEmpName('');
        setEmployeeID('');
      }
      getEmployeeNameByRegNo()
    }
  }, [employeeNumber]);

  useEffect(() => {
    if (FormDetails.musterChitID != '0') {
      GetMusterChitCountByMusterID();
    }
  }, [FormDetails.musterChitID, employeeNumber])

  useEffect(() => {
    if (isUpdate) {
      if (jobTypeMuster == 3 || jobTypeMuster == 6) {
        if (FormDetails.jobTypeID == 5 && jobTypeMuster == 3) {
          if (parseFloat(amount) >= (FormDetails.norm / 2)) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 3
            });
            if ((FormDetails.norm / 2) <= parseFloat(amount) < FormDetails.minNoam) {
              setDay(2)
            }
            else {
              setDay(1)
            }
          }
          else {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 5
            });
            setDay(0)
          }
        }
        else if (FormDetails.jobTypeID == 3 && jobTypeMuster == 3) {
          if (parseFloat(amount) >= (FormDetails.norm / 2)) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 3
            });
            if ((FormDetails.norm / 2) <= parseFloat(amount) < FormDetails.minNoam) {
              setDay(2)
            }
            else {
              setDay(1)
            }
          }
          else {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 5
            });
            setDay(0)
          }
        }
        else if (FormDetails.jobTypeID == 7 && jobTypeMuster == 6) {
          if (parseFloat(amount) >= (FormDetails.norm / 2)) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 6
            });
            if ((FormDetails.norm / 2) <= parseFloat(amount) < FormDetails.minNoam) {
              setDay(2)
            }
            else {
              setDay(1)
            }
          }
          else {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 7
            });
            setDay(0)
          }
        }
        else if (FormDetails.jobTypeID == 6 && jobTypeMuster == 6) {
          if (parseFloat(amount) >= (FormDetails.norm / 2)) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 6
            });
          }
          else {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 7
            });
            setDay(0)
          }
        }
        else {
          setFormDetails({
            ...FormDetails,
            jobTypeID: jobTypeMuster
          });
        }
      }
      else {
        setFormDetails({
          ...FormDetails,
          jobTypeID: jobTypeMuster
        });
        setDay(0)
        setOverKilo(0)
      }
    }
    else {
      if (amount === '' || amount === null) {
        setFormDetails({
          ...FormDetails,
          jobTypeID: jobTypeMuster
        });
      }
      else if (amount)
        if (parseFloat(amount) < (FormDetails.norm / 2)) {
          if (jobTypeMuster == 3 || jobTypeMuster == 8) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 5
            });
          }
          else if (jobTypeMuster == 6) {
            setFormDetails({
              ...FormDetails,
              jobTypeID: 7
            });
          }
        }
        else {
          setFormDetails({
            ...FormDetails,
            jobTypeID: jobTypeMuster
          });
        }
    }
  }, [amount])


  useEffect(() => {

    if (FormDetails.lentEstateID > 0) {
      getLentEstateNameByLentEstateID();
    }
  }, [FormDetails.lentEstateID])

  useEffect(() => {
    if (!isUpdate) {
      setEmpName('');
      setEmployeeID('');
    }
  }, [FormDetails.musterChitID]);

  useEffect(() => {
    const collectedDate = new Date(FormDetails.collectedDate);
    const isSunday = collectedDate.getDay() === 0;
    const isAmountLessThanHalfNorm = parseFloat(amount) < (parseFloat(FormDetails.norm) / 2);

    setFormDetails(prevFormDetails => ({
      ...prevFormDetails,
      isHoliday: (isSunday && (FormDetails.jobTypeID !== 5 && FormDetails.jobTypeID !== 7)) && !isAmountLessThanHalfNorm && parseInt(FormDetails.jobTypeID) !== 8
    }));
  }, [FormDetails.collectedDate, amount, FormDetails.norm, FormDetails.jobTypeID]);

  useEffect(() => {
    if (isUpdate) {
      isEditable();
    }
  }, [minDate]);

  useEffect(() => {
    if (amount === '') {
      return;
    }

    const parsedAmount = parseFloat(amount);
    const halfNorm = parseFloat(FormDetails.norm) / 2;

    setFormDetails(prevFormDetails => ({
      ...prevFormDetails,
      //jobTypeID: parsedAmount < halfNorm ? 5 : jobTypeMuster,
      isHoliday: parsedAmount < halfNorm || parsedAmount >= halfNorm && (prevFormDetails.jobTypeID === '5' || prevFormDetails.jobTypeID === '7' || prevFormDetails.jobTypeID === '8') ? false : prevFormDetails.isHoliday
    }));
  }, [amount, FormDetails.norm, jobTypeMuster]);

  const handleClick = () => {
    if (attendenceData.length == 0) {
      navigate('/app/attendancePlucking/listing');
    } else {
      setConfirmationOpen(true)
    }
  }

  const handleNo = () => {
    setConfirmationOpen(false);
  }

  const handleYes = () => {
    AddDailyCheckRoll();
    setConfirmationOpen(false);
    navigate('/app/attendancePlucking/listing');
  }

  const handleEnterNo = () => {
    setEnterBtnConfirm(false);
  }

  const handleEnterYes = () => {
    if (isUpdate) {
      AddDailyCheckRoll();
    } else {
      if (amount > 0) {
        if (addingSuccess === false) {
          addDetailsToGrid();
          setEnterBtnConfirm(false);
          setEmpName('')
          setEmployeeID('');
          setAmount('')
          setEmployeeNumber('')
        }
      }
    }
  }


  async function getGangDetailsByDivisionID() {
    var response = await services.getGangDetailsByDivisionID(FormDetails.divisionID);
    setGangs(response);
  };

  async function getFieldDetailsByDivisionIDForDropdown() {
    var response = await services.getFieldDetailsByDivisionIDForDropdown(FormDetails.divisionID);
    setFieldsForDropDown(response);
  };

  async function getDivisionDetailsByEstateID() {
    var response = await services.getDivisionDetailsByEstateID(FormDetails.estateID);
    setDivisions(response);
  };

  async function getEstateDetailsByGroupID() {
    var response = await services.getEstateDetailsByGroupID(FormDetails.groupID);
    setEstates(response);
  };

  async function getOperatorsForDropdown() {
    const result = await services.getOperatorsForDropdown();
    setOperators(result);
  }

  async function GetMusterChitCountByMusterID() {
    var response = await services.GetMusterChitCountByMusterID(FormDetails.musterChitID);
    SetMusterCount(response.updatedMusterChitCount);
  }

  async function getLentEstateNameByLentEstateID() {
    const result = await services.getLentEstateNameByLentEstateID(FormDetails.lentEstateID)
    setLentEstateName(result);
  }

  async function getMusterchitDetailsByMusterchitID() {
    setEmployeeNumber('');
    setEmployeeGenderID(0);
    var response = await services.getMusterchitDetailsByMusterchitID(parseInt(FormDetails.musterChitID));
    if (!isUpdate) {
      setFormDetails({
        ...FormDetails,
        divisionID: response.fieldID === 0 ? response.lentDivisionID : response.lentFieldID === 0 ? response.divisionID : 0,
        jobTypeID: response.pluckingJobTypeID,
        fieldID: response.fieldID === 0 ? response.lentFieldID : response.lentFieldID === 0 ? response.fieldID : 0,
        workTypeID: response.fieldID === 0 ? '2' : response.lentFieldID === 0 ? '1' : 0,
        lentEstateID: response.lentEstateID,
      });
    }
    setJobTypeMuster(response.pluckingJobTypeID);
  };

  async function getMusterchitDetailsByMusterchitIDForUpdate() {
    var response = await services.getMusterchitDetailsByMusterchitID(parseInt(FormDetails.musterChitID));
    setJobTypeMuster(response.pluckingJobTypeID);
  };

  async function getAllGroups() {
    var response = await services.getAllGroups();
    setGroups(response);
  };

  async function getJobTypesForDropDown() {
    var response = await services.GetJobTypesForDropDown();
    setJobTypes(response);
  };

  async function getMusterChitDetailsByDateDivisionID() {
    var response = await services.getMusterChitDetailsByDateDivisionID(FormDetails.mainDivisionID, FormDetails.collectedDate, isUpdate);
    setMusterChitList(response);
  };

  async function getNormValueByEstateID() {
    let model = {
      estateID: parseInt(FormDetails.estateID),
      fieldID: parseInt(FormDetails.fieldID),
      genderID: parseInt(employeeGenderID),
      jobTypeID: parseInt(FormDetails.jobTypeID),
      collectedDate: FormDetails.collectedDate
    }
    var response = await services.getNormValueByEstateID(model);
    if (response.statusCode == 'Success') {
      setFormDetails({
        ...FormDetails,
        norm: response.data == null ? 0 : response.data.normValue,
        minNoam: response.data == null ? 0 : response.data.minNormValue
      })
    }
  };

  async function getPermissions() {
    var permissions = await authService.getPermissionsByScreen(screenCode);
    var isAuthorized = permissions.find(p => p.permissionCode == 'ADDEDITATTENDANCEPLUCKING');

    if (isAuthorized === undefined) {
      navigate('/404');
    }
    var isGroupFilterEnabled = permissions.find(p => p.permissionCode == 'GROUPDROPDOWN');
    var isFactoryFilterEnabled = permissions.find(p => p.permissionCode == 'FACTORYDROPDOWN');

    setPermissions({
      ...permissionList,
      isGroupFilterEnabled: isGroupFilterEnabled !== undefined,
      isFactoryFilterEnabled: isFactoryFilterEnabled !== undefined,
    });
    setFormDetails({
      ...FormDetails,
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      estateID: parseInt(tokenService.getFactoryIDFromToken())
    })
  }

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  async function getPluckingAttendanceDetailsByAttendanceID(employeeAttendanceID) {
    await timeout(2000);
    setIsUpdate(true);
    let response = await services.getPluckingAttendanceDetailsByAttendanceID(employeeAttendanceID);
    setJobTypeMuster(response.jobTypeID)
    const collectedDate = response.collectedDate ? response.collectedDate.split('T')[0] : '';
    setFormDetails({
      ...FormDetails,
      groupID: response.groupID,
      estateID: response.estateID,
      divisionID: response.divisionID,
      collectedDate: collectedDate,
      jobTypeID: response.jobTypeID,
      employeeTypeID: response.employeeTypeID,
      employeeNumber: response.employeeNumber,
      workTypeID: response.workTypeID,
      fieldID: response.fieldID,
      gangID: response.gangID,
      sessionID: response.sessionID,
      amount: response.amount,
      days: response.dayType,
      norm: response.noam,
      isActive: response.isActive,
      isHoliday: response.isHoliday,
      musterChitID: response.musterChitID,
      mainDivisionID: response.mainDivisionID,
      operatorID: response.operatorID,
      lentEstateID: response.lentEstateID,
      minNoam: response.minNoam
    });
    setOverKilo(response.overKilo)
    setEmployeeNumber(response.employeeNumber)
    setAmount(response.amount)
  }

  async function AddDailyCheckRoll() {
    if (isUpdate) {
      let dataModel = {
        employeeAttendanceID: parseInt(atob(employeeAttendanceID.toString())),
        amount: amount === '' ? parseFloat(0) : parseFloat(amount),
        overKilo: parseFloat(overKilo),
        createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
        dayType: days == 0 ? 3 : parseFloat(FormDetails.days),
        jobTypeID: parseInt(FormDetails.jobTypeID),
        operatorID: parseInt(FormDetails.operatorID),
        manDays: parseFloat(days),
        isHoliday: FormDetails.isHoliday
      }
      let response = await services.updateDailyCheckroll(dataModel);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        allClearData();
        navigate('/app/attendancePlucking/listing');
      }
      else {
        alert.error(response.message);
      }
    }
    else {
      let response = await services.saveDailyCheckroll(attendenceData);
      if (response.statusCode == "Success") {
        alert.success(response.message);
        allClearData();
        setAttendenceData([])
      }
      else {
        alert.error(response.message);
      }
    }
  }
  async function getEmployeeNameByRegNo() {
    if (!isUpdate) {
      setEmpName('');
      setEmployeeID('')
    }
    let empNameResponse = await services.getEmployeeNameByRegNo(employeeNumber, FormDetails.mainDivisionID);
    if (empNameResponse !== null) {
      setEmpName(empNameResponse.firstName);
      setEmployeeID(empNameResponse.employeeID);
    }
  }

  async function addDetails() {
    setEnterBtnConfirm(true);
  }

  async function addDetailsToGrid() {
    if (amount === '' || parseFloat(amount) === 0 || parseInt(amount) <= 0 || !Number.isInteger(parseFloat(amount))) {
      alert.error("Invalid Amount")
    }
    else {
      if (parseInt(employeeTypeCheck) === 2 && parseInt(FormDetails.jobTypeID) === 3) {
        alert.error("Cannot add genaral jobs to contract employees")
      }
      else {
        var isRegNoValidate = await services.GetRegisterNoValidateByMainDivision(FormDetails.mainDivisionID, employeeNumber, employeeID);
        if (isRegNoValidate.data > 0) {
          var validateStaffEmployee = await services.GetEmployeeNoForStaffEmployee(employeeNumber, employeeID);
          if (validateStaffEmployee.data == 0) {
            let employeeName;
            let empNameResponse = await services.getEmployeeNameByRegNo(employeeNumber, FormDetails.mainDivisionID);
            employeeName = empNameResponse.firstName
            let dataModel = {
              groupID: parseInt(FormDetails.groupID),
              estateID: parseInt(FormDetails.estateID),
              divisionID: parseInt(FormDetails.divisionID),
              collectedDate: (FormDetails.collectedDate),
              employeeTypeID: parseInt(employeeTypeCheck),
              jobTypeID: parseInt(FormDetails.jobTypeID),
              workTypeID: parseInt(FormDetails.workTypeID),
              employeeNumber: employeeNumber,
              amount: amount === '' ? parseFloat(0) : parseFloat(amount),
              sessionID: parseInt(FormDetails.sessionID),
              fieldID: parseInt(FormDetails.fieldID),
              gangID: parseInt(FormDetails.gangID),
              dayType: FormDetails.norm == 0 ? 3 : parseFloat(FormDetails.days),
              dayOT: parseInt(FormDetails.jobTypeID) == 5 || parseInt(FormDetails.jobTypeID) == 7 ? parseInt(0) : parseInt(overKilo),
              nightOT: 0,
              createdBy: parseInt(tokenDecoder.getUserIDFromToken()),
              noam: parseFloat(FormDetails.norm),
              isActive: true,
              isHoliday: parseFloat(FormDetails.days) === 3 ? false : FormDetails.isHoliday,
              musterChitID: parseInt(FormDetails.musterChitID),
              mainDivisionID: parseInt(FormDetails.mainDivisionID),
              operatorID: parseInt(FormDetails.operatorID),
              employeeName: employeeName,
              manDays: parseInt(FormDetails.jobTypeID) == 3 || parseInt(FormDetails.jobTypeID) == 6 || parseInt(FormDetails.jobTypeID) == 8 ? parseFloat(days) : parseInt(0)
            }

            var gridValid = attendenceData.find(p => p.employeeNumber === dataModel.employeeNumber && p.collectedDate === dataModel.collectedDate)
            if (gridValid) {
              alert.error("Attendance is Already Exists")
              setEmployeeNumber('')
              setEmpName('')
              setEmployeeID('')

            }
            else {
              var CheckAttendance = await services.CheckAttendanceSundryPlucking(employeeNumber, moment(dataModel.collectedDate).format("YYYY-MM-DD"), dataModel.jobTypeID, employeeID)
              if (CheckAttendance.statusCode == "Success") {
                var validateTheJobs = await services.ValidateTheJobsWithJobType(employeeNumber, moment(dataModel.collectedDate).format("YYYY-MM-DD"), employeeID, dataModel.jobTypeID);
                if (validateTheJobs.statusCode == "Success") {
                  var response = await services.DecreaseTheMusterChitEmployeeCount(dataModel.musterChitID, dataModel.musterChitID, tokenDecoder.getUserIDFromToken());
                  if (response.data == 1) {
                    setAttendenceData(attendenceData => [...attendenceData, dataModel]);
                    setAddingSuccess(false)
                    GetMusterChitCountByMusterID()
                    var manDays = attendenceCount;
                    manDays += dataModel.manDays;
                    setAttendenceCount(manDays);

                    var xamount = totalKg;
                    xamount += dataModel.amount;
                    SetTotalKg(xamount);

                    var ovrKg = totalOverKg;
                    ovrKg += dataModel.dayOT;
                    SetTotalOverKg(ovrKg);

                    var cashAtt = attendenceCashCount;
                    if (dataModel.dayOT == 0 && dataModel.jobTypeID === 5) {
                      cashAtt += 1;
                      setAttendenceCashCount(cashAtt);
                    }
                    setEmpName('')
                    setEmployeeID('')
                    setAmount('')
                    setEmployeeNumber('')
                  }
                  else {
                    alert.error(response.message)
                  }
                } else {
                  alert.error(validateTheJobs.message)
                }
              } else {
                alert.error(CheckAttendance.message)
              }
            }
            setFormDetails({
              ...FormDetails,
              days: '0',
              jobTypeID: jobTypeMuster
            })
            //setDay(0);
          } else {
            alert.error(validateStaffEmployee.message)
          }
        } else {
          alert.error(isRegNoValidate.message)
        }
      }

    }
  }


  async function getEmployeeTypesForDropdown() {
    const result = await services.GetEmployeeTypesData();
    setEmployeeTypes(result);
  }

  async function getDailyCheckRollDetail() {
    if (employeeNumber === "") {
      return 0
    }
    else {
      var responseEmpType = await services.getDailyCheckRollEmptypeDetail(employeeNumber, FormDetails.mainDivisionID);
      setEmployeeTypeCheck(responseEmpType === null ? 0 : responseEmpType.employeeTypeID);
      setEmployeeGenderID(responseEmpType === null ? 0 : responseEmpType.genderID)
    }
  };

  function checkDayType() {
    if (parseFloat(amount) >= FormDetails.minNoam && parseFloat(amount) <= FormDetails.norm) {
      setDaysValue("1")
    }
    else if (parseFloat(amount) >= FormDetails.norm) {
      if (parseFloat(amount) == 0 && FormDetails.norm == 0) {
        setDaysValue("0");
        setDay(0)
      } else {
        setDaysValue("1")
      }
    } else if (parseFloat(amount) >= FormDetails.norm / 2 && parseFloat(amount) < FormDetails.norm) {
      setDaysValue("2")
    } else if (parseFloat(amount) == 0 && FormDetails.norm == 0) {
      setDaysValue("0");
      setDay(0)
    } else if (parseFloat(amount) < (FormDetails.norm / 2)) {
      setDaysValue("3");
      setDay(0)
    } else {
      if (amount == '' || amount == 0) {
        setDaysValue("0");
        setDay(0)
      } else {
        setDaysValue("2");
      }
    }
  }

  async function getAttendanceExecutionDate() {
    const result = await services.getAttendanceExecutionDate(
      FormDetails.groupID,
      FormDetails.estateID,
      FormDetails.mainDivisionID
    );

    const newMinDate = new Date(currentDate);
    newMinDate.setDate(currentDate.getDate() - (result.dayCount));
    setMinDate(newMinDate);
  }

  async function calOverKilo() {
    if (FormDetails.isHoliday === true) {
      if (FormDetails.days == '1' && (parseFloat(FormDetails.norm) < parseFloat(amount))) {
        var overKilo = 0;
        overKilo = parseFloat(amount) - parseFloat(FormDetails.norm);
        setOverKilo(overKilo);
        setDay(1.5)
      }
      else if (FormDetails.days == '2' && (parseFloat(FormDetails.norm) / 2 < parseFloat(amount))) {
        var overKilo = 0;
        overKilo = (parseFloat(amount) - (parseFloat(FormDetails.norm) / 2));
        setOverKilo(overKilo);
        setDay(0.75)
      } else if (FormDetails.days == '3' && (parseFloat(FormDetails.norm) / 2 > parseFloat(amount))) {
        setOverKilo(0);
        setDay(0)
      }
      else {
        if (FormDetails.days == '1') {
          setOverKilo(0);
          setDay(1.5)
        } else if (FormDetails.days == '2') {
          setOverKilo(0);
          setDay(0.75)
        }
        else {
          setOverKilo(0);
          setDay(0)
        }
      }
    } else {
      if (FormDetails.days == '1' && (parseFloat(FormDetails.norm) < parseFloat(amount))) {
        var overKilo = 0;
        overKilo = parseFloat(amount) - parseFloat(FormDetails.norm);
        setOverKilo(overKilo);
        setDay(1)
      }
      else if (FormDetails.days == '2' && (parseFloat(FormDetails.norm) / 2 < parseFloat(amount))) {
        var overKilo = 0;
        overKilo = (parseFloat(amount) - (parseFloat(FormDetails.norm) / 2));
        setOverKilo(overKilo);
        setDay(0.5)
      } else if (FormDetails.days == '3' && (parseFloat(FormDetails.norm) / 2 > parseFloat(amount))) {
        setOverKilo(0);
        setDay(0)
      }
      else {
        if (FormDetails.days == '1') {
          setOverKilo(0);
          setDay(1)
        } else if (FormDetails.days == '2') {
          setOverKilo(0);
          setDay(0.5)
        }
        else {
          setOverKilo(0);
          setDay(0)
        }
      }
    }
  }

  function handleChange(e) {
    const target = e.target;
    const value = target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    });
  }

  function handleChangeEmpNo(e) {
    const target = e.target;
    const value = target.value
    setEmployeeNumber(value)
  }

  function handleChangeAmount(e) {
    const target = e.target;
    const value = target.value
    setAmount(value)
  }

  function generateDropDownMenu(data) {
    let items = []
    if (data != null) {
      for (const [key, value] of Object.entries(data)) {
        items.push(<MenuItem key={key} value={key}>{value}</MenuItem>);
      }
    }
    return items
  }

  async function handleClickEdit(rowData) {
    setAttendenceRowData(rowData);
    setDeleteConfirmationOpen(true);
  }

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false)
  }

  async function handleClickDeleteConfirm() {
    setDeleteConfirmationOpen(false);
    if (attendenceRowData.musterChitID != 0) {
      var response = await services.IncreaseTheMusterChitEmployeeCount(attendenceRowData.musterChitID, attendenceRowData.musterChitID, tokenDecoder.getUserIDFromToken());
      if (response == 1) {
        setAttendenceData(attendenceData.filter(item => item.tableData.id !== attendenceRowData.tableData.id))
        GetMusterChitCountByMusterID()
        var manDays = attendenceCount;
        manDays -= attendenceRowData.manDays;
        setAttendenceCount(manDays);

        var xamount = totalKg;
        xamount -= attendenceRowData.amount;
        SetTotalKg(xamount);

        var ovrKg = totalOverKg;
        ovrKg -= attendenceRowData.dayOT;
        SetTotalOverKg(ovrKg);

        var cashAtt = attendenceCashCount;
        if (attendenceRowData.dayOT == 0 && attendenceRowData.jobTypeID === 5) {
          cashAtt -= 1;
          setAttendenceCashCount(cashAtt);
        }
      }
    }
  }

  function cardTitle(titleName) {
    return (
      <Grid container spacing={1}>
        <Grid item md={10} xs={12}>
          {titleName}
        </Grid>
        <Grid item md={2} xs={12}>
          <PageHeader
            onClick={handleClick}
            isEdit={false}
            toolTiptitle={"Attendance Plucking Listing"}
          />
        </Grid>
      </Grid>
    )
  }

  async function clearDays() {
    if (!isUpdate) {
      setFormDetails({
        ...FormDetails,
        days: '0'
      });
    }
  }

  function allClearData() {
    setFormDetails({
      ...FormDetails,
      jobTypeID: '0',
      employeeTypeID: '0',
      employeeNumber: '',
      workTypeID: '0',
      fieldID: '0',
      gangID: '0',
      sessionID: '0',
      amount: '',
      days: '0',
      employeeTypeID: '0',
      musterChitID: '0',
      mainDivisionID: '0',
      empName: '',
      isHoliday: false
    });
    setEmployeeNumber('')
    setEmpName('')
    setEmployeeID('')

    setAttendenceCount(0);
    SetTotalKg(0);
    SetTotalOverKg(0);
    setAttendenceCashCount(0);

  }

  const handleKeyDownChange = (event, nextInputref) => {
    if (employeeNumber !== null && empName !== '') {
      if (event.key === 'Enter') {
        event.preventDefault();
        nextInputref.current.focus();
      }
    }
  }

  const handleKeyDownChange1 = (event, nextInputref) => {
    if (employeeNumber !== null || employeeNumber !== '') {
      if (event.key === 'Enter') {
        if (FormDetails.jobTypeID == 3) {
          if (FormDetails.norm != 0) {
            event.preventDefault();
            setEnterBtnConfirm(true);
            nextInputref.current.focus();
          }
        } else {
          event.preventDefault();
          setEnterBtnConfirm(true);
          nextInputref.current.focus();
        }
      }
    }
  }

  const handleKeyDownChange2 = (event, nextInputref) => {
    if (employeeNumber !== null || employeeNumber !== '') {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isUpdate) {
          if (amount > 0) {
            if (addingSuccess === false) {
              addDetailsToGrid();
              setEmpName('')
              setEmployeeID('')
              setAmount('')
              setEmployeeNumber('')
              setEnterBtnConfirm(false);
            }
          } else {
            setEnterBtnConfirm(false);
            alert.error("Amount is Required")
          }
        } else {
          AddDailyCheckRoll();
        }
        nextInputref.current.focus();
      }
    }
  }

  const handleKeyDownChange3 = (event, nextInputref) => {
    if (employeeNumber !== null || employeeNumber !== '') {
      if (event.key === 'Enter') {
        event.preventDefault();
        setEnterBtnConfirm(false);
        nextInputref.current.focus();
      }
    }
  }

  function isHolidayhandleChange(e) {
    const target = e.target
    const value = target.name === 'isHoliday' ? target.checked : target.value
    setFormDetails({
      ...FormDetails,
      [e.target.name]: value
    })
  }

  function isEditable() {
    if (isUpdate) {
      if (FormDetails.collectedDate >= minDateString && FormDetails.collectedDate <= maxDate) {
        setIsEdit(true);
      } else {
        setIsEdit(false);
      }
    }
  };

  return (
    <Fragment>
      <LoadingComponent />
      <Page className={classes.root} title={"Attendance - Plucking"}>
        <Container maxWidth={false}>
          <Formik
            initialValues={{
              groupID: FormDetails.groupID,
              estateID: FormDetails.estateID,
              divisionID: FormDetails.divisionID,
              attendanceDate: FormDetails.attendanceDate,
              jobTypeID: FormDetails.jobTypeID,
              employeeTypeID: employeeTypeCheck,
              employeeNumber: employeeNumber,
              workTypeID: FormDetails.workTypeID,
              fieldID: FormDetails.fieldID,
              gangID: FormDetails.gangID,
              norm: FormDetails.norm,
              sessionID: FormDetails.sessionID,
              amount: amount,
              days: FormDetails.days,
              collectedDate: FormDetails.collectedDate,
              isHoliday: FormDetails.isHoliday,
              mainDivisionID: FormDetails.mainDivisionID,
              musterChitID: FormDetails.musterChitID,
              empName: empName
            }}
            validationSchema={
              Yup.object().shape({
                groupID: Yup.number().min(1, "Please Select a Group").required('Group is required'),
                estateID: Yup.number().min(1, "Please Select a Estate").required('Estate is required'),
                divisionID: Yup.number().when('lentEstateID', {
                  is: (lentEstateID) => lentEstateID > 0,
                  then: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                  otherwise: Yup.number().nullable(),
                }),
                mainDivisionID: Yup.number().min(1, "Please Select a Division").required('Division is required'),
                musterChitID: Yup.number().min(1, "Please Select a Muster Chit").required('Muster Chit is required'),
                jobTypeID: Yup.number().min(1, "Please Select a Job Type").required('Job Type is required'),
                employeeTypeID: Yup.number().min(1, "Please Select a Employee Type").required('Employee Type is required'),
                employeeNumber: Yup.string().required('Employee Number is required').typeError('Employee Number is required'),
                workTypeID: Yup.number().min(1, "Please Select a labour Type").required('Labour Type is required'),
                days: Yup.number(),
                attendanceDate: Yup.string(),
                fieldID: Yup.number().when('lentstateID', {
                  is: (lentstateID) => lentstateID > 0,
                  then: Yup.number().required('Field is required').min(1, 'Field is required').typeError('Field is required'),
                  otherwise: Yup.number().nullable(),
                }),
                amount: Yup.number()
                  .integer('Please enter a valid integer amount')
                  .moreThan(0, 'Amount must be greater than zero')
                  .required('Amount is required'),
                collectedDate: Yup.date().required('Collected date is required').typeError('Invalid date'),
                norm: Yup.number().when('jobTypeID', {
                  is: (jobTypeID) => jobTypeID == 3,
                  then: Yup.number().required('Norm is required').min(1, 'Norm is required').typeError('Norm is required'),
                  otherwise: Yup.number().nullable(),
                }),
              })
            }
            onSubmit={() => trackPromise(addDetails())}
            enableReinitialize
          >
            {({
              errors,
              handleBlur,
              handleSubmit,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mt={0}>
                  <Card>
                    <CardHeader
                      title={cardTitle(title)}
                    />
                    <PerfectScrollbar>
                      <Divider />
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="groupID">
                              Group *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.groupID && errors.groupID)}
                              fullWidth
                              helperText={touched.groupID && errors.groupID}
                              name="groupID"
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.groupID}
                              variant="outlined"
                              size='small'
                              id="groupID"
                              InputProps={{
                                readOnly: !permissionList.isGroupFilterEnabled ? true : false
                              }}
                            >
                              <MenuItem value={'0'}>--Select Group--</MenuItem>
                              {generateDropDownMenu(groups)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="estateID">
                              Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.estateID && errors.estateID)}
                              fullWidth
                              helperText={touched.estateID && errors.estateID}
                              name="estateID"
                              placeholder='--Select Estate--'
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.estateID}
                              variant="outlined"
                              id="estateID"
                              InputProps={{
                                readOnly: !permissionList.isFactoryFilterEnabled ? true : false || attendenceData.length > 0 || isUpdate
                              }}
                            >
                              <MenuItem value={0}>--Select Estate--</MenuItem>
                              {generateDropDownMenu(estates)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="mainDivisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.mainDivisionID && errors.mainDivisionID)}
                              fullWidth
                              helperText={touched.mainDivisionID && errors.mainDivisionID}
                              name="mainDivisionID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.mainDivisionID}
                              variant="outlined"
                              id="mainDivisionID"
                              inputProps={{
                                readOnly: isUpdate || attendenceData.length > 0
                              }}
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="collectedDate">
                              Collected Date *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.collectedDate && errors.collectedDate)}
                              helperText={touched.collectedDate && errors.collectedDate}
                              fullWidth
                              size="small"
                              name="collectedDate"
                              type="date"
                              onChange={(e) => handleChange(e)}
                              value={FormDetails.collectedDate}
                              variant="outlined"
                              id="collectedDate"
                              disabled={isUpdate}
                              inputProps={{
                                max: maxDate,
                                min: minDateString,
                                readOnly: attendenceData.length > 0,
                              }}
                            />
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="musterChitID">
                              Muster Chit *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.musterChitID && errors.musterChitID)}
                              fullWidth
                              helperText={touched.musterChitID && errors.musterChitID}
                              name="musterChitID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.musterChitID}
                              variant="outlined"
                              id="musterChitID"
                              inputProps={
                                { readOnly: isUpdate || attendenceData.length > 0 }
                              }
                            >
                              <MenuItem value={0}>--Select Muster Chit--</MenuItem>
                              {generateDropDownMenu(musterChitList)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeNumber">
                              Employee No*
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.employeeNumber && errors.employeeNumber)}
                              fullWidth
                              helperText={touched.employeeNumber && errors.employeeNumber}
                              name="employeeNumber"
                              placeholder='--Select Employee No'
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChangeEmpNo(e);
                              }}
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                              value={employeeNumber}
                              inputRef={empNoRef}
                              variant="outlined"
                              id="employeeNumber"
                              onKeyDown={(e) => handleKeyDownChange(e, amountRef)}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="empName">
                              Emp Name *
                            </InputLabel>
                            <TextField
                              error={Boolean(touched.empName && errors.empName)}
                              fullWidth
                              helperText={touched.empName && errors.empName}
                              name="empName"
                              onBlur={handleBlur}
                              size='small'
                              placeholder='--Employee Name--'
                              onChange={(e) => handleChange(e)}
                              value={empName}
                              variant="outlined"
                              id="empName"
                              type="text"
                              inputProps={{
                                readOnly: true
                              }}
                            >
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="employeeTypeID">
                              Employee Type
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.employeeTypeID && errors.employeeTypeID)}
                              fullWidth
                              helperText={touched.employeeTypeID && errors.employeeTypeID}
                              name="employeeTypeID"
                              onBlur={handleBlur}
                              size='small'
                              inputProps={
                                { readOnly: true, }
                              }
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              InputProps={{
                                readOnly: isUpdate ? true : false
                              }}
                              value={employeeTypeCheck}
                              variant="outlined"
                              id="employeeTypeID"
                            >
                              <MenuItem value={'0'} >--Select Employee Type</MenuItem>
                              {generateDropDownMenu(employeeTypes)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="workTypeID">
                              Labour Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.workTypeID && errors.workTypeID)}
                              fullWidth
                              helperText={touched.workTypeID && errors.workTypeID}
                              name="workTypeID"
                              onBlur={handleBlur}
                              size='small' value={FormDetails.workTypeID}
                              onChange={(e) => { handleChange(e) }}
                              variant="outlined"
                              id="workTypeID"
                              InputProps={{ readOnly: true }}
                            >
                              <MenuItem value={'0'} >--Select Labour Type--</MenuItem>
                              <MenuItem value={'1'} >Division Labour</MenuItem>
                              <MenuItem value={'2'} >Lent Labour</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="lentEstateID">
                              Lent Estate *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.lentEstateID && errors.lentEstateID)}
                              fullWidth
                              helperText={touched.lentEstateID && errors.lentEstateID}
                              name="lentEstateID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={FormDetails.lentEstateID}
                              variant="outlined"
                              id="lentEstateID"
                              disabled={FormDetails.lentEstateID > 0 ? false : true}
                              inputProps={{
                                // readOnly: dailyCropDetail.workType == 1
                                readOnly: true
                              }}
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(lentEstateName)}
                            </TextField>
                          </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="divisionID">
                              Division *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.divisionID && errors.divisionID)}
                              fullWidth
                              helperText={touched.divisionID && errors.divisionID}
                              name="divisionID"
                              size='small'
                              onBlur={handleBlur}
                              onChange={(e) => {
                                handleChange(e);
                              }}
                              value={FormDetails.divisionID}
                              variant="outlined"
                              id="divisionID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value={0}>--Select Division--</MenuItem>
                              {generateDropDownMenu(divisions)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="fieldID">
                              Field *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.fieldID && errors.fieldID)}
                              fullWidth
                              helperText={touched.fieldID && errors.fieldID}
                              name="fieldID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.fieldID}
                              variant="outlined"
                              id="fieldID"
                              InputProps={{
                                readOnly: true
                              }}
                            >
                              <MenuItem value={'0'}>--Select Field--</MenuItem>
                              {generateDropDownMenu(fieldsForDropdown)}
                            </TextField>
                          </Grid>
                          <Grid item md={3} xs={12}>
                            <InputLabel shrink id="jobTypeID">
                              Job Type *
                            </InputLabel>
                            <TextField select
                              error={Boolean(touched.jobTypeID && errors.jobTypeID)}
                              fullWidth
                              helperText={touched.jobTypeID && errors.jobTypeID}
                              name="jobTypeID"
                              onBlur={handleBlur}
                              size='small'
                              onChange={(e) => {
                                handleChange(e)
                              }}
                              value={FormDetails.jobTypeID}
                              variant="outlined"
                              id="jobTypeID"
                              InputProps={{ readOnly: true }}
                            >
                              <MenuItem value={'0'} >--Select Job Type--</MenuItem>
                              {generateDropDownMenu(JobTypes)}
                            </TextField>
                          </Grid>

                        </Grid>
                        <br />
                        <br />
                        <Card>
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="sessionID">
                                  Session
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.sessionID && errors.sessionID)}
                                  fullWidth
                                  helperText={touched.sessionID && errors.sessionID}
                                  name="sessionID"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={'4'}
                                  variant="outlined"
                                  id="sessionID"
                                  InputProps={{
                                    readOnly: true
                                  }}
                                >
                                  <MenuItem value={'0'} >--Select Session--</MenuItem>
                                  <MenuItem value={'1'} >Morning Session</MenuItem>
                                  <MenuItem value={'2'} >Noon Session</MenuItem>
                                  <MenuItem value={'3'} >Evening Session</MenuItem>
                                  <MenuItem value={'4'} >All Sessions</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="gangID">
                                  Gang
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.gangID && errors.gangID)}
                                  fullWidth
                                  helperText={touched.gangID && errors.gangID}
                                  name="gangID"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChange(e)
                                  }}
                                  value={FormDetails.gangID}
                                  variant="outlined"
                                  id="gangID"
                                  InputProps={{
                                    readOnly: isUpdate ? true : false
                                  }}
                                >
                                  <MenuItem value={'0'}>--Select Gang--</MenuItem>
                                  {generateDropDownMenu(gangs)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="amount">
                                  Amount(Kg) *
                                </InputLabel>
                                <TextField
                                  error={Boolean(touched.amount && errors.amount)}
                                  fullWidth
                                  helperText={touched.amount && errors.amount}
                                  name="amount"
                                  onBlur={handleBlur}
                                  size='small'
                                  onChange={(e) => {
                                    handleChangeAmount(e)
                                  }}
                                  value={amount}
                                  inputRef={amountRef}
                                  variant="outlined"
                                  id="amount"
                                  onKeyDown={(e) => handleKeyDownChange1(e, empNoRef)}
                                >
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <InputLabel shrink id="operatorID">
                                  Operator
                                </InputLabel>
                                <TextField select
                                  error={Boolean(touched.operatorID && errors.operatorID)}
                                  fullWidth
                                  helperText={touched.operatorID && errors.operatorID}
                                  name="operatorID"
                                  onBlur={handleBlur}
                                  value={FormDetails.operatorID}
                                  variant="outlined"
                                  size='small'
                                  id="operatorID"
                                  onChange={(e) => handleChange(e)}
                                >
                                  <MenuItem value={'0'}>--Select Operator--</MenuItem>
                                  {generateDropDownMenu(operators)}
                                </TextField>
                              </Grid>
                              <Grid item md={3} xs={12}>
                                <FormControlLabel
                                  style={{ marginTop: '25px' }}
                                  control={
                                    <Switch
                                      checked={FormDetails.isHoliday}
                                      onChange={(e) => isHolidayhandleChange(e)}
                                      name="isHoliday"
                                      disabled={isUpdate || FormDetails.jobTypeID === 8 ? true : false}
                                    />
                                  }
                                  label="Is Holiday"
                                />
                              </Grid>
                            </Grid>
                            {FormDetails.jobTypeID === 3 || FormDetails.jobTypeID === 6 || FormDetails.jobTypeID === 8 ? (
                              <Grid container spacing={3}>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="norm">
                                    Norm(Kg) *
                                  </InputLabel>
                                  <TextField
                                    error={Boolean(touched.norm && errors.norm)}
                                    fullWidth
                                    helperText={touched.norm && errors.norm}
                                    name="norm"
                                    onBlur={handleBlur}
                                    size='small'
                                    onChange={(e) => {
                                      handleChange(e)
                                    }}
                                    value={FormDetails.norm}
                                    variant="outlined"
                                    id="norm"
                                    InputProps={{
                                      readOnly: true
                                    }}
                                  >
                                  </TextField>
                                </Grid>
                              </Grid>
                            ) : null}
                          </CardContent>
                        </Card>
                        <br />
                        {FormDetails.jobTypeID === '3' || FormDetails.jobTypeID === 3 || FormDetails.jobTypeID === '6' || FormDetails.jobTypeID === 6 || FormDetails.jobTypeID === '8' || FormDetails.jobTypeID === 8 ?
                          <CardContent>
                            <Grid container spacing={4}>
                              <>
                                <Grid item md={3} xs={12}>
                                  <InputLabel shrink id="gangID">
                                    Full/Half/Cash *
                                  </InputLabel>
                                  <TextField select
                                    error={Boolean(touched.days && errors.days)}
                                    fullWidth
                                    helperText={touched.days && errors.days}
                                    name="days"
                                    onBlur={handleBlur}
                                    onChange={(e) => handleChange(e)}
                                    size='small'
                                    value={FormDetails.days}
                                    variant="outlined"
                                    disabled={isUpdate ? false : true || FormDetails.isHoliday == true}
                                    InputProps={{
                                      readOnly: isUpdate ? true : false
                                    }}
                                  >
                                    <MenuItem value='0'>--Select Full/Half/Cash--</MenuItem>
                                    <MenuItem value="1">Full Day</MenuItem>
                                    <MenuItem value="2">Half Day</MenuItem>
                                    <MenuItem value="3">Cash</MenuItem>
                                  </TextField>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                    Full Day :{days}
                                  </Typography>
                                </Grid>
                                <Grid item md={3} xs={12}>
                                  <Typography variant="h5" style={{ marginTop: '35px' }} color="text.secondary" gutterBottom>
                                    Over Kilo : {overKilo.toFixed(2)}
                                  </Typography>
                                </Grid>
                              </>
                            </Grid>
                          </CardContent> : null}
                        <CardContent>
                          <Box display="flex" justifyContent="flex-end" p={2}>
                            {isUpdate ? null :
                              <Button
                                color="primary"
                                type="reset"
                                variant="outlined"
                                onClick={() => allClearData()}
                                disabled={isUpdate ? true : false}
                                size='small'
                              >
                                Clear
                              </Button>}
                            <div>&nbsp;</div>
                            {!isUpdate ?
                              <Button
                                color="primary"
                                type="submit"
                                variant="contained"
                                innerRef={addButtonRef}
                                size='small'
                              >
                                {'Add'}
                              </Button> :
                              <Button
                                color="primary"
                                variant="contained"
                                size='small'
                                onClick={() => trackPromise(AddDailyCheckRoll())}
                                disabled={!isEdit}
                              >
                                {'Update'}
                              </Button>}
                          </Box>
                          <Box>
                            {isUpdate ? null :
                              <>
                                {attendenceData.length > 0 ?
                                  <Box sx={{ display: 'flex', marginLeft: '5px' }}>
                                    &nbsp;
                                    <Chip size="small" label={`Muster Chit Employee Count : ${musterCount}`} style={{ color: 'black', backgroundColor: '#82A0D8', fontWeight: 'bold' }} />
                                    &nbsp;
                                    <Chip size="small" label={`Attendance Mandays : ${attendenceCount}`} style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#B0D9B1' }} />
                                    &nbsp;
                                    <Chip size="small" label={`Attendance Cash Kilo : ${attendenceCashCount}`} style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#B0D9B1' }} />
                                    &nbsp;
                                    <Chip size="small" label={`Total Kg : ${totalKg}`} style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#B0D9B1' }} />
                                    &nbsp;
                                    <Chip size="small" label={`Total Over Kg : ${totalOverKg}`} style={{ color: 'black', fontWeight: 'bold', backgroundColor: '#B0D9B1' }} />
                                  </Box> : null}
                                <br />
                                {attendenceData.length > 0 ?
                                  <MaterialTable
                                    title="Multiple Actions Preview"
                                    columns={[
                                      { title: 'Emp No', field: 'employeeNumber' },
                                      { title: 'Emp Name', field: 'employeeName' },
                                      {
                                        title: 'Job Type', field: 'jobTypeID', render: rowData => JobTypes[rowData.jobTypeID]
                                      },
                                      { title: 'Amount (Kg) ', field: 'amount' },
                                      {
                                        title: 'Overkilo ', field: 'dayOT', render: rowData => rowData.dayOT === 0 ? '-' : rowData.dayOT
                                      },
                                      { title: 'Mandays ', field: 'manDays', render: rowData => rowData.manDays === 0 ? '-' : rowData.manDays },
                                    ]}
                                    data={attendenceData}
                                    options={{
                                      exportButton: false,
                                      showTitle: false,
                                      headerStyle: { textAlign: "center", height: '1%' },
                                      cellStyle: { textAlign: "center" },
                                      columnResizable: false,
                                      actionsColumnIndex: -1
                                    }}
                                    actions={[
                                      {
                                        icon: 'delete',
                                        tooltip: 'Remove record',
                                        onClick: (event, rowData) => { handleClickEdit(rowData) }
                                      },
                                    ]}
                                  />
                                  : null}
                              </>
                            }
                            {(isUpdate && attendenceData.length > 0) ?
                              <>
                                <Box display="flex" justifyContent="flex-end" p={2}>
                                  {attendenceData.length > 0 ? null :
                                    <>
                                      <Button
                                        color="primary"
                                        variant="outlined"
                                        type="button"
                                        // onClick={() => trackPromise(handleCancel())}
                                        size='small'
                                        disabled={isUpdate}
                                      >
                                        Clear
                                      </Button>
                                      <div>&nbsp;</div>
                                    </>
                                  }
                                  <Button
                                    color="primary"
                                    variant="contained"
                                    type="button"
                                    // onClick={() => trackPromise(SaveEmployeeSundry())}
                                    size='small'
                                    disabled={!isEdit}
                                  >
                                    Update
                                  </Button>
                                </Box>
                              </>
                              :
                              <>
                                {attendenceData.length > 0 ?
                                  <Box display="flex" justifyContent="flex-end" p={2}>
                                    <Button
                                      color="primary"
                                      variant="contained"
                                      type="button"
                                      onClick={() => trackPromise(AddDailyCheckRoll())}
                                      size='small'
                                    >
                                      Upload
                                    </Button>
                                  </Box>
                                  : null}
                              </>
                            }
                          </Box>
                        </CardContent>
                      </CardContent>
                      <Dialog
                        open={deleteConfirmationOpen}
                        onClose={handleCancelDelete}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="alert-dialog-slide-title">
                          <Typography
                            color="textSecondary"
                            gutterBottom
                            variant="h3">
                            <Box textAlign="center">
                              Delete Confirmation
                            </Box>
                          </Typography>
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-slide-description">
                            <Typography variant="h4">Are you sure want to delete this record ?</Typography>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <br />
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleClickDeleteConfirm} color="primary" autoFocus>
                            Delete
                          </Button>
                          <Button onClick={handleCancelDelete} color="primary">
                            Cancel
                          </Button>

                        </DialogActions>
                      </Dialog>

                      {/* page back navigation confirmation */}
                      <Dialog
                        open={confirmationOpen}
                        onClose={handleNo}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="alert-dialog-slide-title">
                          <Typography
                            color="textSecondary"
                            gutterBottom
                            variant="h3">
                            <Box textAlign="center">
                              Confirmation
                            </Box>
                          </Typography>
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-slide-description">
                            <Typography variant="h5">Are you sure do you want to save the data and go back?</Typography>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <br />
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleYes} color="primary" autoFocus>
                            Yes
                          </Button>
                          <Button onClick={handleNo} color="primary">
                            No
                          </Button>
                        </DialogActions>
                      </Dialog>

                      {/*Enter Btn confirmation */}
                      <Dialog
                        open={enterBtnConfirm}
                        onClose={handleEnterNo}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle id="alert-dialog-slide-title">
                          <Typography
                            color="textSecondary"
                            gutterBottom
                            variant="h3">
                            <Box textAlign="center">
                              Adding Confirmation
                            </Box>
                          </Typography>
                        </DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-slide-description">
                            <Typography variant="h5">{isUpdate ? "Are you sure you want to update this record?" : "Are you sure you want to add this record?"}</Typography>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <br />
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleEnterYes} color="primary" autoFocus inputRef={enterBtnRef} onKeyDown={(e) => handleKeyDownChange2(e, empNoRef)}>
                            Yes
                          </Button>
                          <Button onClick={handleEnterNo} color="primary" onKeyDown={(e) => handleKeyDownChange3(e, empNoRef)}>
                            No
                          </Button>
                        </DialogActions>
                      </Dialog>
                    </PerfectScrollbar>
                  </Card>
                </Box>
              </form>
            )}
          </Formik>
        </Container>
      </Page>
    </Fragment>)


}
