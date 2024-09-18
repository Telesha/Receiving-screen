import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import AccountView from 'src/views/account/AccountView';
import CustomerListView from 'src/views/customer/CustomerListView';
import DashboardView from 'src/views/reports/DashboardView';
import LoginView from 'src/views/auth/LoginView';
import NotFoundView from 'src/views/errors/NotFoundView';
import RegisterView from 'src/views/auth/RegisterView';
import SettingsView from 'src/views/settings/SettingsView';
import UserListing from 'src/views/user/Pages/Listing';
import UserAddEdit from 'src/views/user/Pages/AddEdit';
import GroupAddEdit from 'src/views/Group/Pages/AddEdit';
import GroupListing from 'src/views/Group/Pages/Listing';
import FactoryListing from 'src/views/Factory/Pages/Listing';
import FactoryAddEdit from 'src/views/Factory/Pages/AddEdit';
import CollectionTypeAddEdit from 'src/views/CollectionType/Pages/AddEdit';
import CollectionTypeListing from 'src/views/CollectionType/Pages/Listing';
import { ContactInformation } from 'src/views/Factory/Pages/TabPages/ContactInformation';
import CustomerAddEdit from 'src/views/CustomerMaintenance/Pages/AddEdit';
import CustomerListing from 'src/views/CustomerMaintenance/Pages/Listing';
import ProductAddEdit from 'src/views/product/Pages/AddEdit';
import ProductListing from 'src/views/product/Pages/Listing';
import RouteAddEdit from 'src/views/Route/Pages/AddEdit';
import RouteListing from 'src/views/Route/Pages/Listing';
import FactoryGRNListing from 'src/views/FactoryItemGRN/Pages/Listing';
import FactoryGRNAddEdit from 'src/views/FactoryItemGRN/Pages/AddEdit';
import FactoryItemAddEdit from 'src/views/FactoryItem/Pages/AddEdit';
import FactoryItemListing from 'src/views/FactoryItem/Pages/Listing';
import FactoryItemAdjustmentListing from 'src/views/FactoryItemAdjustment/Pages/Listing';
import FactoryItemAdjustmentAddEdit from 'src/views/FactoryItemAdjustment/Pages/AddEdit';
import PermissionListing from 'src/views/Rolepermissions/Pages/Listing';
import FactoryItemRequestListing from 'src/views/FactoryItemRequest/Pages/Listing';
import FactoryItemRequestView from 'src/views/FactoryItemRequest/Pages/View';
import AdvancePaymentRequestListing from 'src/views/OverAdvancePaymentRequest/Pages/Listing';
import AdvancePaymentRequestView from 'src/views/OverAdvancePaymentRequest/Pages/View';
import RoleAddEdit from 'src/views/Role/Pages/AddEdit';
import RoleListing from 'src/views/Role/Pages/Listing';
import FactoryItemApprovalListing from 'src/views/FactoryItemApproval/Pages/Listing';
import AdvancePaymentApprovalAddEdit from 'src/views/AdvancePaymentRequestApproval/Pages/AddEdit';
import AdvancePaymentApprovalListing from 'src/views/AdvancePaymentRequestApproval/Pages/Listing';
import Unauthorized from './utils/unauthorized';
import CollectionTypeAdvanceRate from 'src/views/CollectionTypeAdvanceRate/Pages/AddEdit';
import BalancePaymentListing from 'src/views/BalancePayment/Pages/Listing';
import CustomerBalancePaymentAddEdit from 'src/views/CustomerBalancePayment/Pages/AddEdit';
import CustomerBalancePaymentViewBalance from 'src/views/CustomerBalancePayment/Pages/ViewBalance';
import CustomerBalancePaymentListing from 'src/views/CustomerBalancePayment/Pages/Listing';
import AdvancePaymentListing from 'src/views/AdvancePayment/Pages/Listing';
import CollectionTypeBalanceAddEdit from 'src/views/CollectionTypeBalanceRate/Pages/AddEdit';
import ManualLeafUploadAddListing from 'src/views/ManualLeafUpload/Pages/AddEdit';
import PasswordChange from 'src/views/user/Pages/PasswordChange';
import FactoryItemMobileRequestIssue from 'src/views/FactoryItemApproval/Pages/FactoryItemMobileRequestIssue';
import FactoryItemDirectIssue from 'src/views/FactoryItemApproval/Pages/FactoryItemDirectIssue';
import AdvancePaymentApproveRejectListing from 'src/views/AdvancePaymentApproveReject/Pages/Listing';
import CropBulkUploadAddEdit from 'src/views/CropBulkUpload/Pages/AddEdit';
import LeafAmendmentListing from 'src/views/LeafAmendment/Pages/ListingEdit';
import FactoryItemSupplierAddEdit from 'src/views/Supplier/Pages/AddEdit';
import FactoryItemSupplierListing from 'src/views/Supplier/Pages/Listing';
import FundMasterAddEdit from 'src/views/FundMasterScreen/Pages/AddEdit';
import FundMaintenanceListing from 'src/views/FundMasterScreen/Pages/listing';
import CustomerHistory from 'src/views/CustomerHistory/Pages/Listing';
import OverAdvanceCreate from 'src/views/OverAdvancePaymentRequest/Pages/AddEdit';
import CustomerProfileMain from 'src/views/CustomerProfile/Pages/ProfileMain';
import LoanRequest from 'src/views/Loan/Pages/AddEdit';
import LoanRequestListing from 'src/views/Loan/Pages/Listing';
import ManualTransactionUpload from './views/ManualTransactionUpload/Pages/AddEdit';
import LoanRequestApprovalReject from './views/Loan/Pages/ApprovalReject';
import ChartOfAccountListing from './views/ChartOfAccount/Pages/Listing';
import ChartOfAccountTreeViewListing from './views/ChartOfAccount/Pages/ChartOfAccountTreeView';
import CustomerBalanceReconciliation from './views/CustomerBalanceReconciliation/Pages/AddEdit';
import GeneralJournalAddEdit from './views/GeneralJournal/Pages/AddEdit';
import GeneralJournalListing from './views/GeneralJournal/Pages/Listing';
import GLMappingListing from './views/GLMapping/Pages/GLMapping';
import GLMappingAddEdit from './views/GLMapping/Pages/AddEdit';
import GeneralJournalApprove from './views/GeneralJournal/Pages/Approve';
import GeneralJournalView from './views/GeneralJournal/Pages/View';
import GLMappingApproveReject from './views/GLMapping/Pages/ApproveReject';
import BalancePaymentSummaryReport from './views/ReportingModules/BalancePaymentSummaryReport/Pages/Report';
import ChangeUserPassword from './views/user/Pages/ChangePasswordByUser';
import LedgerAccountApprovalListing from './views/LedgerAccountApproval/Pages/Listing';
import LedgerAccountApprovalEdit from './views/LedgerAccountApproval/Pages/AccountApproval';
import PurchaseOrderAddEdit from './views/PurchaseOrder/Pages/AddEdit';
import PurchaseOrderListing from './views/PurchaseOrder/Pages/Listing';
import CashCustomerReport from './views/ReportingModules/CashCustomerReport/Pages/Report';
import BankCustomerDetailsReport from './views/ReportingModules/BankCustomerDetailsReport/Pages/Report';
import BankSummaryReport from './views/ReportingModules/BankSummaryReport/Pages/Report';
import InquiryRegistry from './views/ReportingModules/InquiryRegistry/Pages/Report';
import DailyPaymentReport from './views/ReportingModules/DailyPaymentReport/Pages/Report';
import ChequeCustomerReport from './views/ReportingModules/ChequeCustomerReport/Pages/Report';
import CustomerChequePrint from './views/CustomerChequePrint/Pages/CustomerChequePrint';
import BalancePaymentBankIssuance from './views/BalancePaymentBankIssuance/Pages/Listing';
import AdvancePaymentDetails from './views/AdvancePaymentDetails/Pages/Listing';
import ViewAdvancePaymentStatusHistory from './views/AdvancePaymentDetails/Pages/ViewStatusHistory';
import CutomerBulkUpload from './views/CutomerBulkUpload/Pages/AddEdit';
import BulkReceiptPrint from './views/BulkReceiptPrint/Pages/Listing';
import RouteSummaryReport from './views/ReportingModules/RouteSummaryReport/Pages/Report';
import DailyCropReport from './views/ReportingModules/DailyCropReport/Pages/Report';
import ClientRegistrationReport from './views/ReportingModules/ClientRegistrationReport/Pages/Report';
import RouteCropPercentageReport from './views/ReportingModules/RouteCropPrecentageReport/Pages/Report';
import SlipFileDownload from './views/SlipFileDownload/Pages/Listing';
import RouteCropComparisonReport from './views/ReportingModules/RouteCropComparisonReport/Pages/Report';
import CropSlabReport from './views/ReportingModules/CropSlabReport/Pages/Report';
import CustomerCropSlabReport from './views/ReportingModules/CustomerCropSlabReport/Pages/CropSlabReport';
import SupplierCropComparisonMonthlyReport from './views/ReportingModules/SupplierCropComparisonMonthlyReport/Pages/Report';
import FactoryCropComparisonMonthlyReport from './views/ReportingModules/FactoryCropComparisonMonthlyReport/Pages/Report';
import LoanHistoryReport from './views/ReportingModules/LoanHistoryReport/Pages/Report';
import FactoryItemDetailReport from './views/ReportingModules/FactoryItemDetailReport/Pages/Report';
import CurrentBLLoansReport from './views/ReportingModules/CurrentBLLoansReport/Pages/Report';
import FactoryItemDetailInstalmentReport from './views/ReportingModules/FactoryItemDetailInstallment/Pages/Report';
import LoanIssuedDetailsReport from './views/ReportingModules/LoanIssuedDetailsReport/Pages/Report';
import LoanIssuedWithInASpecificPeriodReport from './views/ReportingModules/LoanIssuedWithInASpecificPeriodReport/Pages/Report';
import TrialBalanceReport from './views/ReportingModules/TrialBalanceReport/Pages/Report';
import FactoryItemSummaryReport from './views/ReportingModules/FactoryItemSummaryReport/Pages/Report';
import SlowMovingDebtListReport from './views/ReportingModules/SlowMovingDebtListReport/Pages/Report';
import SupplyDebtListReport from './views/ReportingModules/SupplyDebtListReport/Pages/Report';
import CropForecastDailyReport from './views/ReportingModules/CropForecastDailyReport/Pages/Report';
import CropForecastMonthlyReport from './views/ReportingModules/CropForecastMonthlyReport/Pages/Report';
import LoanWiseCropReport from './views/ReportingModules/LoanWiseCropReport/Pages/Report';
import BalanceSheetReport from './views/ReportingModules/BalanceSheet/Pages/Report';
import BalanceSheetReportConfigurationSetup from './views/ReportingModules/BalanceSheet/Pages/BalanceSheetConfigurations';
import AllDebtList from './views/ReportingModules/AllDebtList/Pages/Report';
import CropSupplyPatternReport from './views/ReportingModules/CropSupplyPatternReport/Pages/Report';
import NotSupplyDebtListReport from './views/ReportingModules/NotSupplyDebtListReport/Pages/Report';
import BrokerAddEdit from './views/Broker/Pages/AddEdit';
import BrokerListing from './views/Broker/Pages/Listing';
import FactoryEnteringAddEdit from './views/FactoryEntering/Pages/AddEdit';
import FactoryEnteringListing from './views/FactoryEntering/Pages/Listing';
import FactoryEnteringView from './views/FactoryEntering/Pages/View';
import GreenLeafRouteDetails from './views/ReportingModules/GreenLeafRouteDetails/Pages/Report';
import MonthlyCropSummaryReportSupplierWise from './views/ReportingModules/MonthlyCropSummaryReportSupplierWise/Pages/Report';
import GradeAddEdit from 'src/views/Grade/Pages/AddEdit';
import GradeListing from 'src/views/Grade/Pages/Listing';
import SellerContactListing from './views/SellerContact/Pages/Listing';
import SellerContactAddEdit from './views/SellerContact/Pages/AddEdit';
import BuyerAddEdit from './views/BuyerRegistration/Pages/AddEdit';
import BuyerListing from './views/BuyerRegistration/Pages/Listing';
import MonthEndStockListing from './views/MonthEndStock/Pages/Listing';
import MonthEndStockAddEdit from './views/MonthEndStock/Pages/AddEdit';
import GreenLeafEntryListing from './views/ReportingModules/GreenLeafEntry/Pages/Listing';
import GreenLeafEntryAddEdit from './views/ReportingModules/GreenLeafEntry/Pages/AddEdit';
import GreenLeafEntryView from './views/ReportingModules/GreenLeafEntry/Pages/View';
import PhysicalBalanceListing from './views/ReportingModules/PhysicalBalance/Pages/Listing';
import PhysicalBalanceAddEdit from './views/ReportingModules/PhysicalBalance/Pages/AddEdit';
import PhysicalBalanceView from './views/ReportingModules/PhysicalBalance/Pages/View';
import ManufacturingListing from 'src/views/Manufacturing/Pages/Listing';
import ManufacturingAddEditMain from 'src/views/Manufacturing/Pages/TabViews/MainView';
import AcknowledgementListing from './views/Acknowledgement/Pages/Listing';
import AcknowledgementAddEdit from './views/Acknowledgement/Pages/AddEdit';
import EstateListing from './views/Estate/Pages/Listing';
import EstateAddEdit from './views/Estate/Pages/AddEdit';
import DispatchInvoiceListing from './views/DispatchInvoice/Pages/Listing';
import DispatchInvoiceAdd from './views/DispatchInvoice/Pages/Add';
import DispatchInvoiceEdit from './views/DispatchInvoice/Pages/Edit';
import ValuationAddEdit from './views/Valuation/Pages/AddEdit';
import ValuationListing from './views/Valuation/Pages/Listing';
import Catalogue from './views/ReportingModules/Catalogue/Pages/Report';
import DirectSale from './views/DirectSale/Pages/Listing';
import DivisionListing from './views/Division/Pages/Listing';
import DivisionAddEdit from './views/Division/Pages/AddEdit';
import DirectSaleAddEdit from './views/DirectSale/Pages/AddEdit';
import DailyCheckRollAdd from './views/DailyCheckRollAdd/Pages/AddEdit';
import DailyCheckRollListing from './views/DailyCheckRollAdd/Pages/Listing';
import DailyCheckRollReport from './views/ReportingModules/EstateDailyCheckRollViewReport/Pages/Report';
import EmployeeWages from './views/ReportingModules/EmployeeWages/Pages/Report';
import SundryAttendancesAdding from './views/SundryAttendancesAdding/Pages/AddEdit';
import SundryAttendancesView from './views/ReportingModules/SundryAttendancesView/Pages/Report';
import JobWiseAreaCoveredAdding from './views/ReportingModules/JobWiseAreaCoveredAdding/Pages/Report';
import JobWiseAreaCoveredView from './views/ViewJobWiseAreaCovered/Pages/Listing';
import FinancialYearSetup from './views/FinancialYearSetup/Pages/AddEdit';
import ProfitAndLossReport from './views/ReportingModules/ProfitAndLossReport/Pages/Report';
import EmployeeAttendancesListing from './views/EmployeeAttendances/Pages/Listing';
import EmployeeAttendancesAddEdit from './views/EmployeeAttendances/Pages/AddEdit';
import EmployeeAttendanceBulkUpload from './views/EmployeeAttendanceBulkUpload/Pages/AddEdit';
import DebitNoteListing from './views/DebitNote/Pages/Listing';
import DebitNoteAddEdit from './views/DebitNote/Pages/AddEdit';
import PAndLComparisonReport from './views/ReportingModules/PAndLComparison/Pages/Report';
import PAndLComparisonConfigurations from './views/ReportingModules/PAndLComparison/Pages/PAndLComparisonConfigurtions';
import AuditReport from './views/ReportingModules/AuditReport/Pages/Report';
import JournalOberservationReport from './views/ReportingModules/JournalOberservationReport/Pages/Report';
import AuditTrialReport from './views/ReportingModules/AuditTrialReport/Pages/Report';
import ProfitAndLossReportConfigurationSetupMainPage from './views/ReportingModules/ProfitAndLossReport/Pages/ProfitAndLossConfigurationMainPage';
import COPReport from './views/COP/Pages/Report';
import CashFlowReport from './views/CashFlow/Pages/Report';
import FixedAssetAddEdit from './views/FixedAsset/Pages/AddEdit';
import FixedAssetListing from './views/FixedAsset/Pages/Listing';
import TEST from './views/ReportingModules/BalanceSheetComparison/Pages/Report';
import ConfigurationSetup from './views/ReportingModules/BalanceSheetComparison/Pages/Configurations';
import ChequeRegisterReport from './views/ReportingModules/ChequeRegister/Pages/Report';
import CreditNoteAddEdit from './views/CreditNote/Pages/AddEdit';
import CreditNoteListing from './views/CreditNote/Pages/Listing';
import ManufacturingDetailsReport from './views/ReportingModules/ManufacturingDetailsReport/Pages/Report';
import COPReportConfiguration from './views/COP/Pages/ConfigurationMainPage';
import CustomerWiseLoanReport from './views/ReportingModules/CustomerWiseLoanReport/Pages/Report';
import BankReconcilationViewUpdate from './views/BankReconciliation/Pages/ViewUpdate';
import SupplierWiseGrnItemDetail from './views/ReportingModules/SupplierWiseGrnItemDetail/Pages/Report';
import SalaryAdditionsDeductionsListing from './views/SalaryAdditionsDeductions/Pages/Listing';
import SalaryAdditionsDeductionsAddEdit from './views/SalaryAdditionsDeductions/Pages/AddEdit';
import StockBalanceReport from './views/ReportingModules/StockBalanceReport/Pages/Report';
import AccountFreezeListing from './views/AccountFreeze/Pages/Listing';
import AccountFreezeAddEdit from './views/AccountFreeze/Pages/AddEdit';
import CashFlowConfigurationMainPage from './views/CashFlow/Pages/ConfigurationMainPage';
import EmployeeAddEdit from './views/EmployeeRegistration/Pages/AddEdit';
import EmployeeListing from './views/EmployeeRegistration/Pages/Listing';
import LoanReshedulement from './views/Loan/Pages/LoanReschedulement';
import LoanEarlySettlement from './views/Loan/Pages/LoanEarlySettlement';
import BuyerwiseSalesReport from './views/ReportingModules/BuyerwiseSalesReport/Pages/Report';
import HREmployeesList from './views/HRSalaryCalculation/Pages/Listing';
import HRViewEmployeeSalary from './views/HRSalaryCalculation/Pages/ViewEmployeeSalary';
import DebtorsAgeing from './views/ReportingModules/DebtorsAgeing/Pages/Report';
import DebtorsAgeingConfigurationSetup from './views/ReportingModules/DebtorsAgeing/Pages/DebtorsAgeingConfiguration';
import CreditorsAgeing from './views/ReportingModules/CreditorsAgeing/Pages/Report';
import CreditorsAgeingConfigurationSetup from './views/ReportingModules/CreditorsAgeing/Pages/CreditorsAgeingConfiguration';
import ValuationReport from './views/ReportingModules/ValuationReport/Pages/Report';
import InventoryView from './views/FactoryItemStockView/Pages/Listing';
import BuyerwiseGradeSalesReport from './views/ReportingModules/BuyerwiseGradeSalesReport/Pages/Report';
import GradeWiseAverageReport from './views/ReportingModules/GradeWiseAverageReport/Pages/Report';
import SellingMarkWiseGradeReport from './views/ReportingModules/SellingMarkWiseGradeReport/Pages/Report';
import SellingMarkWiseSalesReport from './views/ReportingModules/SellingMarkWiseSalesReport/Pages/Report';
import CustomerWelfare from './views/CustomerWelfare/Pages/Listing';
import CustomerSavings from './views/CustomerSavings/Pages/Listing';
import StockViewReport from './views/ReportingModules/StockViewReport/Pages/Report';
import OpeningBalance from './views/OpeningBalance/Pages/Listing';
import PaymentView from './views/Payment/Pages/View';
import PaymentListing from './views/Payment/Pages/Listing';
import PaymentApprove from './views/Payment/Pages/Approve';
import PaymentAddEdit from './views/Payment/Pages/AddEdit';
import ReceivingView from './views/Receiving/Pages/View';
import ReceivingListing from './views/Receiving/Pages/Listing';
import ReceivingApprove from './views/Receiving/Pages/Approve';
import ReceivingAddEdit from './views/Receiving/Pages/AddEdit';
import MarkStaffAttendance from './views/StaffAttendance/Pages/AddEdit';
import StaffEmployeeAttendancesListing from './views/StaffAttendance/Pages/Listing';
import RequisitionListing from './views/Requisition/Pages/Listing';
import RequisitionAddEdit from './views/Requisition/Pages/AddEdit';
import QuotationInquiry from './views/Requisition/Pages/QuotationInquiry';
import StaffWages from './views/ReportingModules/StaffWages/Pages/Report';
import StaffWagesView from './views/ReportingModules/StaffWages/Pages/View';
import StaffAttendanceView from './views/ReportingModules/StaffAttendanceView/Pages/Report';
import EmployeeLeaveFormAddEdit from './views/EmployeeLeaveForm/Pages/AddEdit';
import EmployeeLeaveFormListing from './views/EmployeeLeaveForm/Pages/Listing';
import AdvanceSlipListing from './views/AdvanceSlip/pages/Listing';
import StatutoryListing from './views/Statutory/Pages/Listing';
import Statutory from './views/Statutory/Pages/AddEdit';
import StatutoryCalculation from './views/ReportingModules/StatutoryCalculation/Pages/Report';
import FieldRegistrationListing from 'src/views/FieldRegistration/Pages/Listing';
import FieldRegistrationAddEdit from 'src/views/FieldRegistration/Pages/AddEdit';
import EmployeeSalaryCalculation from './views/EmployeeSalaryCalculation/Pages/Listing';
import GangRegistrationAddEdit from './views/Gang/Pages/AddEdit';
import GangRegistrationListing from './views/Gang/Pages/Listing';
import BalancePaymentListReport from './views/ReportingModules/BalancePaymentListReport/Pages/Report';
import BalancePaymentListReportFinlays from './views/ReportingModules/BalancePaymentListReportFinlays/Pages/Report';
import DenominationReport from './views/ReportingModules/DenominationReport/Pages/Report';
import LeaveListing from 'src/views/Leave/Pages/Listing';
import LeaveAddEdit from 'src/views/Leave/Pages/AddEdit';
import StockEnteringAddEdit from './views/Stock/Pages/AddEdit';
import StockEnteringListing from './views/Stock/Pages/Listing';
import ConfigurationAddEdit from './views/Configuration/Pages/AddEdit';
import ConfigurationListing from './views/Configuration/Pages/Listing';
import SellingMarkAddEdit from './views/SellingMark/Pages/AddEdit';
import SellingMarkListing from './views/SellingMark/Pages/Listing';
import TeaSalesSummaryReport from './views/ReportingModules/TeaSalesSummaryReport/Pages/Report';
import TeaBookReport from './views/ReportingModules/TeaBookReport/Pages/Report';
import GradeWiseSummaryReport from './views/ReportingModules/GradeWiseSummaryReport/Pages/Report';
import SiftedTeaReport from './views/ReportingModules/SiftedTeaReport/Pages/Report';
import DispatchAndSalesLedgerReport from './views/ReportingModules/DispatchAndSalesLedgerReport/Pages/Report';
import ReturnedTeasReport from './views/ReportingModules/ReturnedTeasReport/Pages/Report';
import BuyerWiseSalesDetailsReport from './views/ReportingModules/BuyerWiseSalesDetailsReport/Pages/Report';
import DispatchDetailsReport from './views/ReportingModules/DispatchDetailsReport/Pages/Report';
import SalesDetailsReport from './views/ReportingModules/SalesDetailsReport/Pages/Report';
import WithdrawnTeasReport from './views/ReportingModules/WithdrawnTeasReport/Pages/Report';
import BrokersStockSummaryReport from './views/ReportingModules/BrokersStockSummaryReport/Pages/Report';
import NoPayListing from './views/NoPay/Pages/Listing';
import NoPayAddEdit from './views/NoPay/Pages/AddEdit';
import VehicleRegistrationAddEdit from './views/VehicleRegistration/Pages/AddEdit';
import VehicleRegistrationListing from './views/VehicleRegistration/Pages/Listing';
import LeafDeduction from './views/LeafDeduction/Pages/Listing';
import DirectSaleReport from './views/ReportingModules/DirectSaleReport/Pages/Report';
import ReturnTeaListing from './views/ReturnTea/Pages/Listing';
import ReturnTeaAddEdit from './views/ReturnTea/Pages/AddEdit';
import BrokerStockListing from './views/BrokerStock/Pages/Listing';
import BrokerStockAddEdit from './views/BrokerStock/Pages/AddEdit';
import LeafDeductionExecution from './views/LeafDeductionExecution/Pages/Listing';
import ScreenManagerAddEdit from './views/ScreenManager/Pages/AddEdit';
import ScreenManagerListing from './views/ScreenManager/Pages/Listing';
import AdvancePaymentUpload from './views/AdvancePaymentUpload/Pages/Listing';
import PowerBiDashboardView from './views/PowerBiDashboard/PowerBiDashboard';
import TeaBookReports from './views/ReportingModules/TeaBookReports/Pages/Report';
import AccountsPayablewithAging from './views/ReportingModules/AccountsPayablewithAging/Pages/Report';
import AccountsReceivableWithAgingReport from './views/ReportingModules/AccountsReceivableWithAgingReport/Pages/Report';
import PurchaseOrderRequestListing from './views/PurchaseOrderRequest/Pages/Listing';
import PurchaseOrderRequestAddEdit from './views/PurchaseOrderRequest/Pages/AddEdit';
import FactoryGRNAddListing from 'src/views/FactoryItemGRNAdd/Pages/Listing';
import FactoryGRNAddAddEdit from 'src/views/FactoryItemGRNAdd/Pages/AddEdit';
import SupplierBankDetailsReport from './views/ReportingModules/SupplierBankDetailsReport/Pages/Report';
import MobileLeafDetailsReport from './views/ReportingModules/MobileLeafDetailsReport/Pages/Report';
import MusterChitAdd from 'src/views/MusterChitAdd/Pages/AddEdit';
import JobAddEdit from './views/Job/Pages/AddEdit';
import JobListing from './views/Job/Pages/Listing';
import EmployeeBulkUpload from './views/EmployeeBulkUpload/Pages/AddEdit';
import JobCategoryListing from './views/JobCategory/Pages/Listing';
import JobCategoryAddEdit from './views/JobCategory/Pages/AddEdit';
import CheckRollAdvanceissuerecoverListing from './views/CheckRollAdvanceIssue&Recover/Pages/Listing';
import CheckRollAdvanceissuerecoverAdd from './views/CheckRollAdvanceIssue&Recover/Pages/Add';
import EmployeeLoanRequest from './views/EmployeeLoan/Pages/AddEdit';
import EmployeeLoanRequestListing from './views/EmployeeLoan/Pages/Listing';
import EmployeeLoanRequestApprovalReject from './views/EmployeeLoan/Pages/ApprovalReject';
import EmployeeLoanEarlySettlement from './views/EmployeeLoan/Pages/LoanEarlySettlement';
import EmployeeLoanReshedulement from './views/EmployeeLoan/Pages/LoanReschedulement';
import MusterChitView from 'src/views/MusterChitView/Pages/AddEdit';
import CheckRollListing from 'src/views/CheckRollDeduction/Pages/Listing';
import CheckRollAddEdit from 'src/views/CheckRollDeduction/Pages/AddEdit';
import SundryAttendancesListing from '../src/views/NonPluckingAttendence/Pages/Listing';
import SundryAttendancesAddingEditing from '../src/views/NonPluckingAttendence/Pages/AddEdit';
import CheckrollDeductionReport from './views/ReportingModules/CheckrollDeductionReport/Pages/Report';
import PluckingSundryAttendanceReport from './views/ReportingModules/PluckingSundryAttendanceReport/Pages/Report';
import SalaryCalculation from './views/SalaryCalculation/Pages/Listing';
import GreenLeafReport from './views/ReportingModules/GreenLeafReport/Pages/Report';
import CheckrollConfiguration from './views/CheckrollConfiguration/Pages/Listing';
import CheckrollConfigurationAddEdit from './views/CheckrollConfiguration/Pages/AddEdit';
import PayrollConfiguration from './views/PayrollConfiguration/Pages/Listing';
import PayrollConfigurationAddEdit from './views/PayrollConfiguration/Pages/AddEdit';
import AdvanceReport from './views/AdvanceReport/Pages/Report';
import NormConfigurationAddEdit from './views/NormConfiguration/Pages/AddEdit';
import NormConfigurationListing from './views/NormConfiguration/Pages/Listing';
import FoodRecoveryListing from './views/FoodRecovery/Pages/Listing';
import FoodRecoveryAddEdit from './views/FoodRecovery/Pages/AddEdit';
import LoanReport from './views/ReportingModules/LoanReport/Pages/Report';
import GreenLeafAndOverkgReport from './views/ReportingModules/GreenLeafAndOverkgReport/Pages/Report';
import OTSummaryReport from './views/OTSummaryReport/Pages/Report';
import SundryCashAttendanceReport from './views/ReportingModules/SundryCashAttendanceReport/Pages/Report';
import PaymentCheckrollSummaryReport2 from './views/ReportingModules/PaymentCheckrollSummaryReport2/Pages/Report';
import PaymentCheckrollSummaryReport1 from './views/ReportingModules/PaymentCheckrollSummary1/Pages/Report';
import SignatureSheet1 from './views/ReportingModules/PayReportSignatureSheet/Pages/Report';
import EPFandETFReport from './views/ReportingModules/EPFandETFReport/Pages/Report';
import HolidayPaySummery from './views/HolidayPaySummery/Pages/Listing';
import Loader from './utils/Loader';
import WorkDistributionSummaryReport from './views/ReportingModules/WorkDistributionSummaryReport/Pages/Report';
import FixedDeductionMasterAdd from 'src/views/FixedDeductionMaster/Pages/AddEdit';
import FixedDeductionMasterListing from 'src/views/FixedDeductionMaster/Pages/Listing';
import MonthlySalaryExecution from './views/MonthlySalaryExecution/Pages/Listing';
import BelowNormReport from './views/ReportingModules/BelowNormReport/Pages/Report';
import EmployeeJobDistributionReport from './views/ReportingModules/EmployeeJobDistributionReport/Pages/Report';
import EPFandETFReturnReport from './views/ReportingModules/EPFandETFReturnReport/Pages/Report';
import MusterChitAddEdit from 'src/views/MusterChitNew/Pages/AddEdit';
import MusterChitListing from 'src/views/MusterChitNew/Pages/Listing';
import AmalgamationReport from './views/ReportingModules/AmalgamationReport/Pages/Report';
import FixedDeductionSetupAddEdit from 'src/views/FixedDeductionSetup/Pages/AddEdit';
import FixedDeductionSetupListing from 'src/views/FixedDeductionSetup/Pages/Listing';
import OtherEarnings from './views/CheckRollOtherAdditions/Pages/Listing';
import OtherEarningsAddEdit from './views/CheckRollOtherAdditions/Pages/AddEdit';
import OTHEREARNINGREPORT from './views/OtherEarningReport/Pages/Report';
import FieldWiseGreenLeafReport from './views/ReportingModules/FieldWiseGreenLeafReport/Pages/Report';
import FoodRecoverySummaryReport from './views/ReportingModules/FoodRecoverySummaryReport/Pages/Report';
import DenominationReportDivisionWise from './views/DenominationReportDivisionWise/Pages/Report';
import DailyWorkReport from './views/DailyWorkReport/Pages/Report';
import CoinBalanceReport from './views/ReportingModules/CoinBalanceReport/Pages/Report';
import LeaveRequestAddEdit from './views/LeaveRequest/Pages/AddEdit';
import LeaveRequestListing from './views/LeaveRequest/Pages/Listing';
import EstimatedAdvaceRateLedgerReport from './views/EstimatedAdvanceRateLedgerReport/Pages/Report';
import DailyAdvanceAndFactoryItemIssueDocument1 from './views/DailyAdvanceAndFactoryItemIssueDocument/Pages/Report';
import CreatePayslip from './views/ReportingModules/CreatePayslip/Pages/Report';
import CreatePayslipView from './views/ReportingModules/CreatePayslip/Pages/View';
import DailyAttendanceListing from './views/DailyAttendance/Pages/Listing';
import DailyAttendanceAdd from './views/DailyAttendance/Pages/AddEdit';
import LeafCollectionNotification from './views/LeafCollectionNotification/Pages/ListingEdit';
import LentLabourReport from './views/ReportingModules/LentLabourReport/Pages/Report';
import FactoryLeafEnteringReport from './views/ReportingModules/FactoryLeafEnteringReport/Pages/Report';
import CropSupplyMonthlyReport from './views/ReportingModules/CropSupplyMonthlyReport/Pages/Report';
import BalancePaymentCheckListReport from './views/ReportingModules/BalancePaymentChecklistReport/Pages/Report';
import TransportRateAdditionExecution from './views/TranportRateAdditionExecution/Pages/Listing';
import DayWiseCropReport from './views/ReportingModules/DayWiseCropReport/Pages/Report';
import PluckingAttendanceBulkUpload from './views/PluckingAttendanceBulkUpload/Pages/AddEdit';
import SundryAttendanceBulkUpload from './views/SundryAttendanceBulkUpload/Pages/AddEdit';
import UnionDeductionReport from './views/ReportingModules/UnionDeductionReport/Pages/Report';
import LankemPaymentListing from './views/PaymentLankem/Pages/Listing';
import LankemPaymentAddEdit from './views/PaymentLankem/Pages/AddEdit';
import LankemPaymentView from './views/PaymentLankem/Pages/View';
import LankemPaymentApprove from './views/PaymentLankem/Pages/Approve';
import CashAdvanceIssue from './views/CashAdvanceIssue/Pages/Listing';
import CashAdvanceReport from './views/CashAdvanceReport/Pages/Report';
import AccountingSuppliersListing from './views/AccountingSuppliers/Pages/Listing';
import AccountingSuppliersAddEdit from './views/AccountingSuppliers/Pages/AddEdit';
import AccountingCustomersListing from './views/AccountingCustomers/Pages/Listing';
import AccountingCustomersAddEdit from './views/AccountingCustomers/Pages/AddEdit';
import LankemReceivingView from './views/ReceivingLankem/Pages/View';
import LankemReceivingListing from './views/ReceivingLankem/Pages/Listing';
import LankemReceivingApprove from './views/ReceivingLankem/Pages/Approve';
import LankemReceivingAddEdit from './views/ReceivingLankem/Pages/AddEdit';
import PaymentCheckrollSummaryReportRevamp from './views/ReportingModules/PaymentCheckrollSummaryReportRevamp/Pages/Report';
import PayrollAdvanceReport from './views/PayrollAdvanceReport/Pages/Report';
import EmployeeDesignationListing from './views/EmployeeDesignation/Pages/Listing';
import EmployeeDesignationAddEdit from './views/EmployeeDesignation/Pages/AddEdit';
import AttendanceMarkListing from './views/AttendanceMark/Page/Listing';
import AttendanceMarkAddEdit from './views/AttendanceMark/Page/AddEdit';
import AttendanceReport from './views/AttendanceReport/Pages/Report';
import PayrollAdvanceAddEdit from './views/PayrollAdvance&Recover/Pages/AddEdit';
import PayrollAdvanceListing from './views/PayrollAdvance&Recover/Pages/Listing';
import SalaryExecutionListing from './views/SalaryExecution/Page/Listing';
import CreatePayslipPayroll from './views/ReportingModules/CreatePayslipPayroll/Pages/Report';
import CreatePayslipViewPayroll from './views/ReportingModules/CreatePayslipPayroll/Pages/View';
import FactoryItemDetailReportKtf from './views/ReportingModules/FactoryItemDetailReportKTF/Pages/Report';
import EPFandESPSReport from './views/ReportingModules/EPFandESPSReport/Pages/Report';
import CashDayPluckingReport from './views/ReportingModules/CashDayPluckingReport/Pages/Report';
import CheckrollWorkDistributionReport from './views/ReportingModules/CheckrollWorkDistributionreport/Pages/Report';
import PayrollListing from './views/PayrollDeduction/Pages/Listing';
import PayrollAddEdit from './views/PayrollDeduction/Pages/AddEdit';


import SupplierEstateMappingListing from './views/SupplierEstateMapping/Pages/Listing';
import SupplierEstateMappingAddEdit from './views/SupplierEstateMapping/Pages/AddEdit';
import DivisionWiseDebtsReport from './views/ReportingModules/DivisionWiseDebtsReport/Pages/Report';
import PayrollDeductionReport from './views/ReportingModules/PayrollDeductionReport/pages/Report';
import CheckrollDateBlocker from './views/CheckrollDateBlocker/Pages/AddEdit';
import FixedDeductionReport from './views/ReportingModules/Fixed Deduction Report/Pages/Report';

import ChildHeaderType from './views/ChildHeaderType/Pages/Listing';
import ChildHeaderTypeAddEdit from './views/ChildHeaderType/Pages/AddEdit';
import PayrollEarning from './views/PayrollEarning/Pages/Listing';
import PayrollEarningAddEdit from './views/PayrollEarning/Pages/AddEdit';
const routes = isLoggedIn => [
  {
    path: 'app',
    element: isLoggedIn ? <DashboardLayout /> : <Navigate to="/signin" />,
    children: [
      { path: 'account', element: <AccountView /> },
      { path: 'customers', element: <CustomerListView /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <Navigate to="/404" /> },
      {
        path: 'users',
        children: [
          { path: 'listing', element: <UserListing /> },
          { path: 'addEdit/:userID', element: <UserAddEdit /> },
          { path: 'passwordChange/:userID', element: <PasswordChange /> },
          {
            path: 'changeUserPassword/:userID',
            element: <ChangeUserPassword />
          }
        ]
      },
      {
        path: 'groups',
        children: [
          { path: 'listing', element: <GroupListing /> },
          { path: 'addEdit/:groupID', element: <GroupAddEdit /> }
        ]
      },
      {
        path: 'products',
        children: [
          { path: 'listing', element: <ProductListing /> },
          { path: 'addEdit/:productID', element: <ProductAddEdit /> }
        ]
      },
      {
        path: 'ADVANCESLIPGENERATE',
        element: <AdvanceSlipListing />
      },
      {
        path: 'routes',
        children: [
          { path: 'listing', element: <RouteListing /> },
          { path: 'addEdit/:routeID', element: <RouteAddEdit /> }
        ]
      },
      {
        path: 'VehicleRegistration',
        children: [
          { path: 'listing', element: <VehicleRegistrationListing /> },
          {
            path: 'addEdit/:vehicleID',
            element: <VehicleRegistrationAddEdit />
          }
        ]
      },
      {
        path: 'customers',
        children: [
          { path: 'listing', element: <CustomerListing /> },
          { path: 'addEdit/:customerID', element: <CustomerAddEdit /> }
        ]
      },
      {
        path: 'collectionTypes',
        children: [
          { path: 'listing', element: <CollectionTypeListing /> },
          {
            path: 'addEdit/:collectionTypeID',
            element: <CollectionTypeAddEdit />
          }
        ]
      },
      {
        path: 'operationEntities',
        children: [
          { path: 'listing', element: <FactoryListing /> },
          { path: 'addEdit/:factoryID', element: <FactoryAddEdit /> },
          { path: 'factoryAccounts/:groupID', element: <ContactInformation /> }
        ]
      },
      {
        path: 'factoryGRN',
        children: [
          { path: 'listing', element: <FactoryGRNListing /> },
          { path: 'addEdit/:factoryItemGRNID', element: <FactoryGRNAddEdit /> }
        ]
      },
      {
        path: 'factoryGRNAdd',
        children: [
          { path: 'listing', element: <FactoryGRNAddListing /> },
          {
            path: 'addEdit/:factoryItemGRNAddID',
            element: <FactoryGRNAddAddEdit />
          }
        ]
      },
      {
        path: 'factoryItemAdjustment',
        children: [
          { path: 'listing', element: <FactoryItemAdjustmentListing /> },
          {
            path: 'addEdit/:factoryItemAdjustmentID',
            element: <FactoryItemAdjustmentAddEdit />
          }
        ]
      },
      {
        path: 'factoryItems',
        children: [
          { path: 'listing', element: <FactoryItemListing /> },
          { path: 'addEdit/:factoryItemID', element: <FactoryItemAddEdit /> }
        ]
      },
      {
        path: 'jobWiseAreaCovered',
        children: [
          { path: 'listing', element: <JobWiseAreaCoveredView /> },
          {
            path: 'addEdit/:jobWiseAreaCoveredID',
            element: <JobWiseAreaCoveredAdding />
          }
        ]
      },

      {
        path: 'roles',
        children: [
          { path: 'listing', element: <RoleListing /> },
          { path: 'addEdit/:roleID', element: <RoleAddEdit /> }
        ]
      },
      {
        path: 'factoryItemRequestDetails',
        children: [
          { path: 'listing', element: <FactoryItemRequestListing /> },
          {
            path: 'viewfactoryItemRequestDetails/:factoryItemRequestID',
            element: <FactoryItemRequestView />
          }
        ]
      },
      {
        path: 'rolePermission',
        children: [
          {
            path: 'listing/:roleID/:roleLevelID',
            element: <PermissionListing />
          }
        ]
      },
      {
        path: 'factoryItemApproval',
        children: [
          { path: 'listing', element: <FactoryItemApprovalListing /> },
          {
            path: 'addEdits/:factoryItemRequestID',
            element: <FactoryItemMobileRequestIssue />
          },
          {
            path: 'itemIssue/:factoryItemRequestID',
            element: <FactoryItemDirectIssue />
          }
        ]
      },
      {
        path: 'advancePaymentRequest',
        children: [
          { path: 'listing', element: <AdvancePaymentRequestListing /> },
          {
            path: 'addEdit/:advancePaymentRequestID',
            element: <OverAdvanceCreate />
          },
          {
            path: 'view/:advancePaymentRequestID',
            element: <AdvancePaymentRequestView />
          }
        ]
      },
      {
        path: 'advancePaymentApproval',
        children: [
          { path: 'listing', element: <AdvancePaymentApprovalListing /> },
          {
            path: 'addEdit/:advancePaymentRequestID',
            element: <AdvancePaymentApprovalAddEdit />
          }
        ]
      },
      {
        path: 'advancePayment',
        children: [{ path: 'listing', element: <AdvancePaymentListing /> }]
      },
      { path: 'unauthorized', element: <Unauthorized /> },
      {
        path: 'balancepayment',
        children: [{ path: 'listing', element: <BalancePaymentListing /> }]
      },
      {
        path: 'customerBalancePayment',
        children: [
          { path: 'listing', element: <CustomerBalancePaymentListing /> },
          {
            path: 'addEdit/:customerBalancePaymentID',
            element: <CustomerBalancePaymentAddEdit />
          },
          {
            path: 'viewPayment/:customerBalancePaymentID',
            element: <CustomerBalancePaymentViewBalance />
          }
        ]
      },
      {
        path: 'AdvanceRate',
        element: <CollectionTypeAdvanceRate />
      },
      {
        path: 'BalanceRate',
        element: <CollectionTypeBalanceAddEdit />
      },
      {
        path: 'manualLeafUpload',
        element: <ManualLeafUploadAddListing />
      },
      {
        path: 'advancePaymentApproveReject',
        children: [
          {
            path: 'listing/:advancePaymentRequestID',
            element: <AdvancePaymentApproveRejectListing />
          }
        ]
      },
      {
        path: 'loan',
        children: [
          { path: 'loanRequest', element: <LoanRequest key={1} /> },
          {
            path: 'loanRequestApproval/:customerLoanID',
            element: <LoanRequestApprovalReject key={1} />
          },
          { path: 'listing', element: <LoanRequestListing /> },
          {
            path: 'loanReshedulement/:customerLoanID',
            element: <LoanReshedulement key={1} />
          },
          {
            path: 'loanEarlySettlement/:customerLoanID',
            element: <LoanEarlySettlement key={1} />
          }
        ]
      },
      {
        path: 'cropDetailsBulkUplaod',
        element: <CropBulkUploadAddEdit />
      },
      {
        path: 'factoryItemSuppliers',
        children: [
          { path: 'listing', element: <FactoryItemSupplierListing /> },
          {
            path: 'addEdit/:supplierID',
            element: <FactoryItemSupplierAddEdit />
          }
        ]
      },
      {
        path: 'leafAmendment',
        element: <LeafAmendmentListing />
      },
      {
        path: 'fundMaintenance',
        children: [
          { path: 'listing', element: <FundMaintenanceListing /> },
          { path: 'addEdit/:fundMasterID', element: <FundMasterAddEdit /> }
        ]
      },
      {
        path: 'customerHistory',
        element: <CustomerHistory />
      },
      {
        path: 'customerProfile',
        element: <CustomerProfileMain />
      },
      {
        path: 'manualTrasactionUpload',
        children: [{ path: 'addEdit', element: <ManualTransactionUpload /> }]
      },
      {
        path: 'chartOfAccount',
        children: [
          { path: 'listing', element: <ChartOfAccountListing /> },
          {
            path: 'viewTreeView/:groupID/:factoryID',
            element: <ChartOfAccountTreeViewListing />
          }
        ]
      },
      {
        path: 'customerBalanceReconciliation',
        element: <CustomerBalanceReconciliation />
      },
      {
        path: 'generalJournal',
        children: [
          { path: 'listing', element: <GeneralJournalListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <GeneralJournalAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <GeneralJournalView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <GeneralJournalApprove />
          }
        ]
      },
      {
        path: 'glmapping',
        children: [
          { path: 'listing', element: <GLMappingListing /> },
          {
            path: 'addEdit/:transactionTypeID/:groupID/:factoryID',
            element: <GLMappingAddEdit />
          },
          {
            path: 'approveReject/:transactionTypeID/:groupID/:factoryID',
            element: <GLMappingApproveReject />
          }
        ]
      },
      {
        path: 'balancePaymentSummaryReport',
        element: <BalancePaymentSummaryReport />
      },
      {
        path: 'ledgerAcoountApproval',
        children: [
          { path: 'listing', element: <LedgerAccountApprovalListing /> },
          {
            path: 'addEdit/:ledgerAccountID',
            element: <LedgerAccountApprovalEdit />
          }
        ]
      },
      {
        path: 'purchaseOrder',
        children: [
          { path: 'listing', element: <PurchaseOrderListing /> },
          {
            path: 'view/:purchaseOrderID',
            element: <PurchaseOrderAddEdit />
          },
          {
            path: 'addEdit/:purchaseOrderID',
            element: <PurchaseOrderAddEdit />
          }
        ]
      },
      {
        path: 'cashCustomerReport',
        element: <CashCustomerReport />
      },
      {
        path: 'cashKiloReport',
        element: <GreenLeafReport />
      },

      {
        path: 'fieldWiseGreenLeafReport',
        element: <FieldWiseGreenLeafReport />
      },

      {
        path: 'greenLeaf&OverKgReport',
        element: <GreenLeafAndOverkgReport />
      },
      {
        path: 'bankCustomerDetailsReport',
        element: <BankCustomerDetailsReport />
      },
      {
        path: 'bankSummaryReport',
        element: <BankSummaryReport />
      },

      {
        path: 'chequeCustomerReport',
        element: <ChequeCustomerReport />
      },
      {
        path: 'PayrollAdvanceReport',
        element: <PayrollAdvanceReport />
      },
      {
        path:
          'ledgerAccountReviewing/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <InquiryRegistry key={1} />
      },
      {
        path:
          'inquiryRegistryFromTrialBalance/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <InquiryRegistry key={2} />
      },
      {
        path:
          'DailyPayment/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <DailyPaymentReport key={1} />
      },
      {
        path:
          'DailyPaymentFromTrialBalance/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation',
        element: <DailyPaymentReport key={2} />
      },
      {
        path: 'customerCheque',
        children: [{ path: 'listing', element: <CustomerChequePrint /> }]
      },
      {
        path: 'balancePaymentBankIssuance',
        element: <BalancePaymentBankIssuance />
      },
      {
        path: 'advancePaymentDetails',
        children: [
          { path: 'listing', element: <AdvancePaymentDetails /> },
          {
            path:
              'ViewAdvancePaymentDetails/:advancePaymentRequestID/:groupID/:factoryID',
            element: <ViewAdvancePaymentStatusHistory />
          }
        ]
      },
      {
        path: 'bulkReceiptPrint',
        element: <BulkReceiptPrint />
      },
      {
        path: 'customerBulkUpload',
        element: <CutomerBulkUpload />
      },
      {
        path: 'routeSummaryReport',
        element: <RouteSummaryReport />
      },
      {
        path: 'mobileLeafDetailsReport',
        element: <MobileLeafDetailsReport />
      },
      {
        path: 'dailyCropReport',
        element: <DailyCropReport />
      },
      {
        path: 'SupplierRegistrationDetailReport',
        element: <ClientRegistrationReport />
      },
      {
        path: 'routeCropPercentageReport',
        element: <RouteCropPercentageReport />
      },
      {
        path: 'buyerWiseSalesDetailsReport',
        element: <BuyerWiseSalesDetailsReport />
      },
      {
        path: 'DirectSaleReport',
        element: <DirectSaleReport />
      },
      {
        path: 'slipFileDownload',
        element: <SlipFileDownload />
      },
      {
        path: 'routeCropComparisonReport',
        element: <RouteCropComparisonReport />
      },
      {
        path: 'cropSlabReport',
        element: <CropSlabReport />
      },
      {
        path: 'customerCropSlabReport',
        element: <CustomerCropSlabReport />
      },
      {
        path: 'supplierCropComparisonMonthlyReport',
        element: <SupplierCropComparisonMonthlyReport />
      },
      {
        path: 'factoryCropComparisonMonthlyReport',
        element: <FactoryCropComparisonMonthlyReport />
      },
      {
        path: 'loanHistoryReport',
        element: <LoanHistoryReport />
      },
      {
        path: 'factoryItemDetailReport',
        element: <FactoryItemDetailReport />
      },
      {
        path: 'factoryItemDetailReportKtf',
        element: <FactoryItemDetailReportKtf />
      },
      {
        path: 'currentBLLoansReport',
        element: <CurrentBLLoansReport />
      },
      {
        path: 'factoryItemDetailInstallmentReport',
        element: <FactoryItemDetailInstalmentReport />
      },
      {
        path: 'loanIssuedDetailsReport',
        element: <LoanIssuedDetailsReport />
      },
      {
        path: 'loanIssuedWithInASpecificPeriodReport',
        element: <LoanIssuedWithInASpecificPeriodReport />
      },
      {
        path:
          'trailBalanceReport/:groupID/:factoryID/:startDate/:endDate/:IsGuestNavigation',
        element: <TrialBalanceReport key={1} />
      },
      {
        path: 'accountsPayablewithAging',
        element: <AccountsPayablewithAging />
      },
      {
        path:
          'trailBalanceReportReturn/:groupID/:factoryID/:startDate/:endDate/:IsGuestNavigation',
        element: <TrialBalanceReport key={2} />
      },
      {
        path: 'factoryItemSummaryReport',
        element: <FactoryItemSummaryReport />
      },
      {
        path: 'slowMovingDebtListReport',
        element: <SlowMovingDebtListReport />
      },
      {
        path: 'supplyDebtListReport',
        element: <SupplyDebtListReport />
      },
      {
        path: 'cropForecastDailyReport',
        element: <CropForecastDailyReport />
      },
      {
        path: 'cropForecastMonthlyReport',
        element: <CropForecastMonthlyReport />
      },
      {
        path: 'loanWiseCropReport',
        element: <LoanWiseCropReport />
      },
      {
        path: 'balanceSheet',
        children: [
          { path: 'balanceSheetReport', element: <BalanceSheetReport /> },
          {
            path: 'balanceSheetSetupConfiguration/:groupID/:factoryID',
            element: <BalanceSheetReportConfigurationSetup />
          }
        ]
      },
      {
        path: 'allDebtList',
        element: <AllDebtList />
      },
      {
        path: 'cropSupplyPatternReport',
        element: <CropSupplyPatternReport />
      },
      {
        path: 'notSupplyDebtListReport',
        element: <NotSupplyDebtListReport />
      },
      {
        path: 'grade',
        children: [
          { path: 'listing', element: <GradeListing /> },
          { path: 'addEdit/:gradeID', element: <GradeAddEdit /> }
        ]
      },
      {
        path: 'sellerContact',
        children: [
          { path: 'listing', element: <SellerContactListing /> },
          {
            path: 'addEdit/:sellerContractID',
            element: <SellerContactAddEdit />
          }
        ]
      },
      {
        path: 'buyerRegistration',
        children: [
          { path: 'listing', element: <BuyerListing /> },
          { path: 'addEdit/:buyerID', element: <BuyerAddEdit /> }
        ]
      },
      {
        path: 'monthEndStock',
        children: [
          { path: 'listing', element: <MonthEndStockListing /> },
          { path: 'addEdit/:roleID', element: <MonthEndStockAddEdit /> }
        ]
      },
      {
        path: 'greenLeafEntry',
        children: [
          { path: 'listing', element: <GreenLeafEntryListing /> },
          {
            path: 'addEdit/:greenLeafEntryID',
            element: <GreenLeafEntryAddEdit />
          },
          { path: 'view/:greenLeafEntryID', element: <GreenLeafEntryView /> }
        ]
      },
      {
        path: 'physicalbalance',
        children: [
          { path: 'listing', element: <PhysicalBalanceListing /> },
          {
            path: 'addEdit/:physicalbalanceID',
            element: <PhysicalBalanceAddEdit />
          },
          { path: 'view/:physicalbalanceID', element: <PhysicalBalanceView /> }
        ]
      },
      {
        path: 'catalogue',
        element: <Catalogue />
      },
      {
        path: 'directSale',
        children: [
          { path: 'listing', element: <DirectSale /> },
          {
            path: 'addEdit/:directSaleID',
            element: <DirectSaleAddEdit />
          }
        ]
      },
      {
        path: 'manufacturing',
        children: [
          { path: 'listing', element: <ManufacturingListing /> },
          {
            path: 'addEdit/:blManufaturingID',
            element: <ManufacturingAddEditMain />
          },
          {
            path: 'viewManufacturing/:blManufaturingID',
            element: <ManufacturingAddEditMain />
          }
        ]
      },
      {
        path: 'acknowledgement',
        children: [
          { path: 'listing', element: <AcknowledgementListing /> },
          {
            path: 'addEdit/:teaProductDispatchID',
            element: <AcknowledgementAddEdit />
          }
        ]
      },
      {
        path: 'estate',
        children: [
          { path: 'listing', element: <EstateListing /> },
          { path: 'addEdit/:factoryID', element: <EstateAddEdit /> },
          { path: 'factoryAccounts/:groupID', element: <ContactInformation /> }
        ]
      },
      {
        path: 'division',
        children: [
          { path: 'listing', element: <DivisionListing /> },
          { path: 'addEdit/:routeID', element: <DivisionAddEdit /> }
        ]
      },
      {
        path: 'dispatchInvoice',
        children: [
          { path: 'listing', element: <DispatchInvoiceListing /> },
          {
            path: 'add/:teaProductDispatchID',
            element: <DispatchInvoiceAdd />
          },
          {
            path: 'edit/:teaProductDispatchID',
            element: <DispatchInvoiceEdit />
          }
        ]
      },
      {
        path: 'valuation',
        children: [
          { path: 'listing', element: <ValuationListing /> },
          { path: 'addEdit/:valuationID', element: <ValuationAddEdit /> }
        ]
      },
      {
        path: 'brokerRegistration',
        children: [
          { path: 'listing', element: <BrokerListing /> },
          { path: 'addEdit/:brokerID', element: <BrokerAddEdit /> }
        ]
      },
      {
        path: 'factoryEntering',
        children: [
          { path: 'listing', element: <FactoryEnteringListing /> },
          {
            path: 'addEdit/:greenLeafReceivingID',
            element: <FactoryEnteringAddEdit />
          },
          {
            path: 'view/:greenLeafReceivingID',
            element: <FactoryEnteringView />
          }
        ]
      },
      {
        path: 'attendancePlucking',
        element: <DailyCheckRollAdd />
      },
      {
        path: 'greenLeafRouteDetails',
        element: <GreenLeafRouteDetails />
      },
      ////update
      {
        path: 'AdvanceReport',
        element: <AdvanceReport />
      },
      {
        path: 'monthlyCropSummaryReportSupplierWise',
        element: <MonthlyCropSummaryReportSupplierWise />
      },
      {
        path: 'attendancePlucking',
        children: [
          {
            path: 'listing',
            element: <DailyCheckRollListing />
          },
          {
            path: 'addEdit/:employeeAttendanceID',
            element: <DailyCheckRollAdd />
          }
        ]
      },
      {
        path: 'dailyCheckRollView',
        element: <DailyCheckRollReport />
      },
      {
        path: 'employeeWages',
        element: <EmployeeWages />
      },
      {
        path: 'attendanceNonPlucking',
        element: <SundryAttendancesAdding />
      },
      {
        path: 'sundryAttendancesView',
        element: <SundryAttendancesView />
      },
      {
        path: 'journalObservationReport',
        element: <JournalOberservationReport />
      },
      {
        path: 'profitAndLoss',
        children: [
          { path: 'profitAndLossReport', element: <ProfitAndLossReport /> },
          {
            path: 'profitAndLossSetupConfiguration/:groupID/:factoryID',
            element: <ProfitAndLossReportConfigurationSetupMainPage />
          }
        ]
      },
      {
        path: 'monthlyCropSummaryReport',
        element: <GreenLeafRouteDetails />
      },
      ///update
      {
        path: 'checkrolladvancereport',
        element: <AdvanceReport />
      },
      {
        path: 'checkrollOTSummaryReport',
        element: <OTSummaryReport />
      },
      {
        path: 'checkrolldailyWorkReport',
        element: <DailyWorkReport />
      },
      //update
      {
        path: 'otherEarningReport',
        element: <OTHEREARNINGREPORT />
      },
      {
        path: 'employeeAttendances',
        children: [
          {
            path: 'listing',
            element: <EmployeeAttendancesListing />
          },
          {
            path: 'addEdit/:employeeAttendancesID',
            element: <EmployeeAttendancesAddEdit />
          }
        ]
      },
      {
        path: 'employeeAttendancesBulkUpload',
        element: <EmployeeAttendanceBulkUpload />
      },
      {
        path: 'auditTrialReport',
        element: <AuditTrialReport />
      },
      {
        path: 'financialYearSetup',
        element: <FinancialYearSetup />
      },
      {
        path: 'COPReport',
        children: [
          { path: 'COPReport', element: <COPReport /> },
          {
            path: 'configuration/:groupID/:factoryID',
            element: <COPReportConfiguration />
          }
        ]
      },
      {
        path: 'CashFlow',
        children: [
          { path: 'CashFlowReport', element: <CashFlowReport /> },
          {
            path: 'configuration/:groupID/:factoryID',
            element: <CashFlowConfigurationMainPage />
          }
        ]
      },
      {
        path: 'PAndLComparison',
        children: [
          { path: 'PAndLComparisonReport', element: <PAndLComparisonReport /> },
          {
            path: 'PAndLComparisonConfigurations/:groupID/:factoryID',
            element: <PAndLComparisonConfigurations />
          }
        ]
      },
      {
        path: 'fixedAsset',
        children: [
          { path: 'listing', element: <FixedAssetListing /> },
          { path: 'addEdit/:groupID', element: <FixedAssetAddEdit /> }
        ]
      },
      {
        path: 'auditReport',
        element: <AuditReport />
      },
      {
        path: 'balanceSheetComparison',
        children: [
          { path: 'Report', element: <TEST /> },
          {
            path: 'ConfigurationSetup/:groupID/:factoryID',
            element: <ConfigurationSetup />
          }
        ]
      },
      {
        path: 'supplierestatemapping',
        children: [
          { path: 'listing', element: <SupplierEstateMappingListing /> },
          {
            path: 'addEdit/:routeID',
            element: <SupplierEstateMappingAddEdit />
          }
        ]
      },
      {
        path: 'chequeRegisterReport',
        element: <ChequeRegisterReport />
      },
      {
        path: 'creditNote',
        children: [
          { path: 'listing', element: <CreditNoteListing /> },
          {
            path: 'addEdit/:groupID/:factoryID/:voucherNumber',
            element: <CreditNoteAddEdit />
          }
        ]
      },
      {
        path: 'DebitNote',
        children: [
          { path: 'listing', element: <DebitNoteListing /> },
          {
            path: 'addEdit/:groupID/:factoryID/:voucherNumber',
            element: <DebitNoteAddEdit />
          }
        ]
      },
      {
        path: 'CustomerWiseLoanReport',
        element: <CustomerWiseLoanReport />
      },
      {
        path: 'bankReconciliation',
        element: <BankReconcilationViewUpdate />
      },
      {
        path: 'supplierWiseGrnItemDetail',
        element: <SupplierWiseGrnItemDetail />
      },
      {
        path: 'salaryAdditionDeduction',
        children: [
          { path: 'listing', element: <SalaryAdditionsDeductionsListing /> },
          {
            path: 'addEdit/:salaryAdjustmentID',
            element: <SalaryAdditionsDeductionsAddEdit />
          }
        ]
      },
      {
        path: 'stockBalanceReport',
        element: <StockBalanceReport />
      },

      {
        path: 'FinancialMonthFreeze',
        children: [
          { path: 'listing', element: <AccountFreezeListing /> },
          {
            path: 'addEdit/:ledgerAccountFreezID',
            element: <AccountFreezeAddEdit />
          }
        ]
      },
      {
        path: 'EmployeeRegistration',
        children: [
          { path: 'listing', element: <EmployeeListing /> },
          { path: 'addEdit/:employeeID', element: <EmployeeAddEdit /> }
        ]
      },
      {
        path: 'manufacturingDetailsReport',
        element: <ManufacturingDetailsReport />
      },
      {
        path: 'HRSalaryCalculation',
        children: [
          { path: 'listing', element: <HREmployeesList /> },
          { path: 'viewSalary/:employeeID', element: <HRViewEmployeeSalary /> }
        ]
      },
      {
        path: 'BuyerwiseSalesReport',
        element: <BuyerwiseSalesReport />
      },
      {
        path: 'DispatchDetailsReport',
        element: <DispatchDetailsReport />
      },
      {
        path: 'DebtorsAgeing',
        children: [
          { path: 'DebtorsAgeingReport', element: <DebtorsAgeing /> },
          {
            path: 'DebtorsAgeingSetupConfiguration/:groupID/:factoryID',
            element: <DebtorsAgeingConfigurationSetup />
          }
        ]
      },
      {
        path: 'CreditorAgeing',
        children: [
          { path: 'CreditorAgeingReport', element: <CreditorsAgeing /> },
          {
            path: 'CreditorAgeingSetupConfiguration/:groupID/:factoryID',
            element: <CreditorsAgeingConfigurationSetup />
          }
        ]
      },
      {
        path: 'valuationReport',
        element: <ValuationReport />
      },

      {
        path: 'InventoryView',
        element: <InventoryView />
      },
      {
        path: 'GradeWiseAverageReport',
        element: <GradeWiseAverageReport />
      },
      {
        path: 'SellingMarkWiseGradeReport',
        element: <SellingMarkWiseGradeReport />
      },
      {
        path: 'SellingMarkWiseSalesReport',
        element: <SellingMarkWiseSalesReport />
      },
      {
        path: 'CustomerWelfare',
        element: <CustomerWelfare />
      },
      {
        path: 'CustomerSavings',
        element: <CustomerSavings />
      },
      {
        path: 'StockViewReport',
        element: <StockViewReport />
      },
      {
        path: 'AccountsReceivableWithAgingReport',
        element: <AccountsReceivableWithAgingReport />
      },
      {
        path: 'PluckingSundryAttendanceReport',
        element: <PluckingSundryAttendanceReport />
      },
      {
        path: 'employeeJobDistributionReport',
        element: <EmployeeJobDistributionReport />
      },
      {
        path: 'lentLabourReport',
        element: <LentLabourReport />
      },
      {
        path: 'PaymentCheckrollSummaryReport',
        element: <PaymentCheckrollSummaryReport1 />
      },

      {
        path: 'SignatureSheet',
        element: <SignatureSheet1 />
      },
      {
        path: 'CoinBalanceReport',
        element: <CoinBalanceReport />
      },
      {
        path: 'Payment',
        children: [
          { path: 'listing', element: <PaymentListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <PaymentAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <PaymentView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <PaymentApprove />
          }
        ]
      },
      {
        path: 'Receiving',
        children: [
          { path: 'listing', element: <ReceivingListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <ReceivingAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <ReceivingView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <ReceivingApprove />
          }
        ]
      },
      {
        path: 'OpeningBalance',
        element: <OpeningBalance />
      },
      {
        path: 'StaffAttendance',
        children: [
          {
            path: 'listing',
            element: <StaffEmployeeAttendancesListing />
          },
          {
            path: 'addEdit',
            element: <MarkStaffAttendance />
          }
        ]
      },
      {
        path: 'staffWages',
        children: [
          { path: 'listing', element: <StaffWages /> },
          { path: 'viewStaffWages/:id', element: <StaffWagesView /> }
        ]
      },
      {
        path: 'createPayslip',
        children: [
          { path: 'listing', element: <CreatePayslip /> },
          {
            path: 'viewCreatePayslip/:employeeId/:month/:year',
            element: <CreatePayslipView />
          }
        ]
      },
      {
        path: 'staffAttendanceView',
        element: <StaffAttendanceView />
      },
      {
        path: 'employeeLeaveForm',
        children: [
          {
            path: 'listing',
            element: <EmployeeLeaveFormListing />
          },
          {
            path: 'addEdit/:leaveRefNo',
            element: <EmployeeLeaveFormAddEdit />
          }
        ]
      },
      {
        path: 'BuyerwiseGradeSalesReport',
        element: <BuyerwiseGradeSalesReport />
      },
      {
        path: 'statutory',
        children: [
          { path: 'listing', element: <StatutoryListing /> },
          { path: 'addEdit/:statutoryID', element: <Statutory /> }
        ]
      },
      {
        path: 'EpfEtfCalculation',
        element: <StatutoryCalculation />
      },
      {
        path: 'checkRollDeduction',
        children: [
          { path: 'listing', element: <CheckRollListing /> },
          {
            path: 'addEdit/:checkRollDeductionID',
            element: <CheckRollAddEdit />
          }
        ]
      },
      {
        path: 'requisition',
        children: [
          {
            path: 'listing',
            element: <RequisitionListing />
          },
          {
            path: 'addEdit',
            element: <RequisitionAddEdit />
          },
          {
            path: 'quotationInquiry',
            element: <QuotationInquiry />
          }
        ]
      },
      {
        path: 'fieldRegistration',
        children: [
          { path: 'listing', element: <FieldRegistrationListing /> },
          { path: 'addEdit/:fieldID', element: <FieldRegistrationAddEdit /> }
        ]
      },
      {
        path: 'EmployeeSalaryCalculation',
        element: <EmployeeSalaryCalculation />
      },
      {
        path: 'gangRegistration',
        children: [
          { path: 'listing', element: <GangRegistrationListing /> },
          { path: 'addEdit/:gangID', element: <GangRegistrationAddEdit /> }
        ]
      },
      {
        path: 'balancePaymentListReport',
        element: <BalancePaymentListReport />
      },
      {
        path: 'denominationReport',
        element: <DenominationReport />
      },
      {
        path: 'ReturnedTeasReport',
        element: <ReturnedTeasReport />
      },
      {
        path: 'noPay',
        children: [
          { path: 'listing', element: <NoPayListing /> },
          { path: 'addEdit/:noPayID', element: <NoPayAddEdit /> }
        ]
      },
      {
        path: 'stockEntering',
        children: [
          { path: 'listing', element: <StockEnteringListing /> },
          { path: 'addEdit/:stockDetailsID', element: <StockEnteringAddEdit /> }
        ]
      },
      {
        path: 'leave',
        children: [
          { path: 'listing', element: <LeaveListing /> },
          { path: 'addEdit/:employeeLeaveDetailsID', element: <LeaveAddEdit /> }
        ]
      },
      {
        path: 'SalesDetailsReport',
        element: <SalesDetailsReport />
      },
      {
        path: 'configuration',
        children: [
          { path: 'listing', element: <ConfigurationListing /> },
          {
            path: 'addEdit/:configurationDetailID',
            element: <ConfigurationAddEdit />
          }
        ]
      },
      {
        path: 'normConfiguration',
        children: [
          { path: 'listing', element: <NormConfigurationListing /> },
          {
            path: 'addEdit/:configurationDetailID',
            element: <NormConfigurationAddEdit />
          }
        ]
      },
      {
        path: 'FoodRecovery',
        children: [
          { path: 'listing', element: <FoodRecoveryListing /> },
          { path: 'addEdit/:foodRecoveryID', element: <FoodRecoveryAddEdit /> }
        ]
      },
      {
        path: 'sellingMark',
        children: [
          { path: 'listing', element: <SellingMarkListing /> },
          { path: 'addEdit/:sellingMarkID', element: <SellingMarkAddEdit /> }
        ]
      },
      {
        path: 'returnTea',
        children: [
          { path: 'listing', element: <ReturnTeaListing /> },
          { path: 'addEdit/:returnTeaID', element: <ReturnTeaAddEdit /> }
        ]
      },
      {
        path: 'teaSalesSummaryReport',
        element: <TeaSalesSummaryReport />
      },
      {
        path: 'teaBookReport',
        element: <TeaBookReport />
      },
      {
        path: 'teaBookReports',
        element: <TeaBookReports />
      },
      {
        path: 'gradeWiseSummaryReport',
        element: <GradeWiseSummaryReport />
      },
      {
        path: 'siftedTeaReport',
        element: <SiftedTeaReport />
      },
      {
        path: 'Dispatch&SalesLedgerReport',
        element: <DispatchAndSalesLedgerReport />
      },
      {
        path: 'WithdrawnTeasReport',
        element: <WithdrawnTeasReport />
      },
      {
        path: 'BrokersStockSummaryReport',
        element: <BrokersStockSummaryReport />
      },
      {
        path: 'leafDeduction',
        element: <LeafDeduction />
      },
      {
        path: 'leafDeductionExecution',
        element: <LeafDeductionExecution />
      },
      {
        path: 'brokerStock',
        children: [
          { path: 'listing', element: <BrokerStockListing /> },
          { path: 'addEdit/:brokerStockID', element: <BrokerStockAddEdit /> }
        ]
      },
      {
        path: 'screenManagement',
        children: [
          { path: 'listing', element: <ScreenManagerListing /> },
          { path: 'addEdit', element: <ScreenManagerAddEdit /> }
        ]
      },
      {
        path: 'advancePaymentUpload',
        element: <AdvancePaymentUpload />
      },
      {
        path: 'powerBiDashboard',
        element: <PowerBiDashboardView />
      },
      {
        path: 'foodrecoverysummaryreport',
        element: <FoodRecoverySummaryReport />
      },
      {
        path: 'supplierBankDetailsReport',
        element: <SupplierBankDetailsReport />
      },
      {
        path: 'purchaseOrderRequest',
        children: [
          { path: 'listing', element: <PurchaseOrderRequestListing /> },
          {
            path: 'view/:purchaseOrderID',
            element: <PurchaseOrderRequestAddEdit />
          },
          {
            path: 'addEdit/:purchaseOrderID',
            element: <PurchaseOrderRequestAddEdit />
          }
        ]
      },
      {
        path: 'musterchitadd',
        element: <MusterChitAdd />
      },
      {
        path: 'musterchitview',
        element: <MusterChitView />
      },
      {
        path: 'job',
        children: [
          { path: 'listing', element: <JobListing /> },
          { path: 'addEdit/:jobID', element: <JobAddEdit /> }
        ]
      },
      {
        path: 'CheckrollOtherEarnings',
        children: [
          { path: 'listing', element: <OtherEarnings /> },
          { path: 'addEdit/:otherEarningID', element: <OtherEarningsAddEdit /> }
        ]
      },
      {
        path: 'DailyAttendance',
        children: [
          { path: 'listing', element: <DailyAttendanceListing /> },
          {
            path: 'addEdit/:DailyAttendanceID',
            element: <DailyAttendanceAdd />
          }
        ]
      },
      {
        path: 'EmployeeBulkUpload',
        element: <EmployeeBulkUpload />
      },
      {
        path: 'jobCategory',
        children: [
          { path: 'listing', element: <JobCategoryListing /> },
          { path: 'addEdit/:jobCategoryID', element: <JobCategoryAddEdit /> }
        ]
      },
      {
        path: 'checkrolladvanceissuerecover',
        children: [
          { path: 'listing', element: <CheckRollAdvanceissuerecoverListing /> },
          {
            path: 'add/:advanceIssueID',
            element: <CheckRollAdvanceissuerecoverAdd />
          }
        ]
      },
      {
        path: 'employeeLoan',
        children: [
          {
            path: 'listing',
            element: <EmployeeLoanRequestListing />
          },
          {
            path: 'employeeloanRequest',
            element: <EmployeeLoanRequest key={1} />
          },
          {
            path: 'loanRequestApproval/:employeeLoanID',
            element: <EmployeeLoanRequestApprovalReject key={1} />
          },
          {
            path: 'loanReshedulement/:employeeLoanID',
            element: <EmployeeLoanReshedulement key={1} />
          },
          {
            path: 'loanEarlySettlement/:employeeLoanID',
            element: <EmployeeLoanEarlySettlement key={1} />
          }
        ]
      },
      {
        path: 'attendenceSundry',
        children: [
          { path: 'listing', element: <SundryAttendancesListing /> },
          {
            path: 'addEdit/:dailySundryAttendanceDetailID',
            element: <SundryAttendancesAddingEditing />
          }
        ]
      },
      {
        path: 'CheckrollDeductionReport',
        element: <CheckrollDeductionReport />
      },
      {
        path: 'SalaryCalculation',
        element: <SalaryCalculation />
      },
      {
        path: 'checkrollConfiguration',
        children: [
          { path: 'listing', element: <CheckrollConfiguration /> },
          {
            path: 'addEdit/:checkrollConfigID',
            element: <CheckrollConfigurationAddEdit />
          }
        ]
      },
      {
        path: 'holidayPaySummery',
        children: [{ path: 'listing', element: <HolidayPaySummery /> }]
      },
      {
        path: 'loanReport',
        element: <LoanReport />
      },

      {
        path: 'sundryCashAttendanceReport',
        element: <SundryCashAttendanceReport />
      },
      {
        path: 'paymentCheckrollSummaryReport2',
        element: <PaymentCheckrollSummaryReport2 />
      },

      {
        path: 'EPF&ETFReport',
        element: <EPFandETFReport />
      },
      {
        path: 'workDistributionSummaryReport',
        element: <WorkDistributionSummaryReport />
      },
      {
        path: 'monthlySalaryExecution',
        element: <MonthlySalaryExecution />
      },
      {
        path: 'belowNormReport',
        element: <BelowNormReport />
      },
      {
        path: 'fixedDeductionMaster',
        children: [
          { path: 'listing', element: <FixedDeductionMasterListing /> },
          {
            path: 'addEdit/:fixedDeductionMasterID',
            element: <FixedDeductionMasterAdd />
          }
        ]
      },
      {
        path: 'EPF&ETFReturnReport',
        element: <EPFandETFReturnReport />
      },
      {
        path: 'fixedDeductionSetup',
        children: [
          { path: 'listing', element: <FixedDeductionSetupListing /> },
          {
            path: 'addEdit/:fixedDeductionSetupID',
            element: <FixedDeductionSetupAddEdit />
          }
        ]
      },
      {
        path: 'musterChitNew',
        children: [
          { path: 'listing', element: <MusterChitListing /> },
          { path: 'addEdit/', element: <MusterChitAddEdit /> }
        ]
      },
      {
        path: 'amalgamationReport',
        element: <AmalgamationReport />
      },
      {
        path: 'leaverequest',
        children: [
          { path: 'listing', element: <LeaveRequestListing /> },
          {
            path: 'addEdit/:employeeLeaveRequestID',
            element: <LeaveRequestAddEdit />
          }
        ]
      },
      {
        path: 'DenomitionReport',
        element: <DenominationReportDivisionWise />
      },
      {
        path: 'estimatedAdvanceRateLedgerReport',
        element: <EstimatedAdvaceRateLedgerReport />
      },
      {
        path: 'dailyAdvanceandfactoryitemissueDocument',
        element: <DailyAdvanceAndFactoryItemIssueDocument1 />
      },
      {
        path: 'LeafCollectionNotification',
        children: [{ path: 'listing', element: <LeafCollectionNotification /> }]
      },
      {
        path: 'factoryLeafEnteringReport',
        element: <FactoryLeafEnteringReport />
      },
      {
        path: 'balancePaymentListFinReport',
        element: <BalancePaymentListReportFinlays />
      },
      {
        path: 'cropSupplyMonthlyReport',
        element: <CropSupplyMonthlyReport />
      },
      {
        path: 'balancePaymentChecklistReport',
        element: <BalancePaymentCheckListReport />
      },
      {
        path: 'trasnportRateAdditionExecution',
        element: <TransportRateAdditionExecution />
      },
      {
        path: 'dayWiseCropReport',
        element: <DayWiseCropReport />
      },
      {
        path: 'PluckingAttendanceBulkUpload',
        element: <PluckingAttendanceBulkUpload />
      },
      {
        path: 'SundryAttendanceBulkUpload',
        element: <SundryAttendanceBulkUpload />
      },
      {
        path: 'unionDeductionReport',
        element: <UnionDeductionReport />
      },
      {
        path: 'LankemPayment',
        children: [
          { path: 'listing', element: <LankemPaymentListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <LankemPaymentAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <LankemPaymentView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <LankemPaymentApprove />
          }
        ]
      },
      {
        path: 'cashAdvanceIssue',
        element: <CashAdvanceIssue />
      },
      {
        path: 'cashAdvanceReport',
        element: <CashAdvanceReport />
      },
      {
        path: 'accountingSuppliers',
        children: [
          { path: 'listing', element: <AccountingSuppliersListing /> },
          {
            path: 'addEdit/:supplierID',
            element: <AccountingSuppliersAddEdit />
          }
        ]
      },
      {
        path: 'accountingCustomers',
        children: [
          { path: 'listing', element: <AccountingCustomersListing /> },
          {
            path: 'addEdit/:customerID',
            element: <AccountingCustomersAddEdit />
          }
        ]
      },
      {
        path: 'LankemReceiving',
        children: [
          { path: 'listing', element: <LankemReceivingListing /> },
          {
            path: 'addEdit/:referenceNumber/:groupID/:factoryID',
            element: <LankemReceivingAddEdit />
          },
          {
            path:
              'view/:groupID/:factoryID/:accountID/:startDate/:endDate/:IsGuestNavigation/:referenceNumber',
            element: <LankemReceivingView />
          },
          {
            path: 'approve/:referenceNumber/:groupID/:factoryID',
            element: <LankemReceivingApprove />
          }
        ]
      },
      {
        path: 'paymentCheckrollSummaryReportRevamp',
        element: <PaymentCheckrollSummaryReportRevamp />
      },
      {
        path: 'payrollConfiguration',
        children: [
          { path: 'listing', element: <PayrollConfiguration /> },
          {
            path: 'addEdit/:payrollConfigID',
            element: <PayrollConfigurationAddEdit />
          }
        ]
      },

      {
        path: 'ChildHeaderType',
        children: [
          { path: 'listing', element: <ChildHeaderType/> },
          {
            path: 'addEdit/:childHeaderTypeID',
            element: <ChildHeaderTypeAddEdit />
          }
        ]
      },

      {
        path: 'employeeDesignation',
        children: [
          { path: 'listing', element: <EmployeeDesignationListing /> },
          {
            path: 'addEdit/:designationID',
            element: <EmployeeDesignationAddEdit />
          }
        ]
      },
      {
        path: 'attendanceMark',
        children: [
          { path: 'listing', element: <AttendanceMarkListing /> },
          {
            path: 'addEdit/:attendanceMarkID',
            element: <AttendanceMarkAddEdit />
          }
        ]
      },
      {
        path: 'PayrollAttendanceReport',
        element: <AttendanceReport />
      },
      {
        path: 'payrolladvance',
        children: [
          { path: 'listing', element: <PayrollAdvanceListing /> },
          {
            path: 'addEdit/:advanceIssueID',
            element: <PayrollAdvanceAddEdit />
          }
        ]
      },
      {
        path: 'salaryExecution',
        children: [{ path: 'listing', element: <SalaryExecutionListing /> }]
      },
      {
        path: 'createPayslipPayroll',
        children: [
          { path: 'listing', element: <CreatePayslipPayroll /> },
          {
            path: 'viewCreatePayslipPayroll/:payRollMonthlyExecutionID',
            element: <CreatePayslipViewPayroll />
          }
        ]
      },
      {
        path: 'EPFESPSReport',
        element: <EPFandESPSReport />
      },
      {
        path: 'cashDayPluckingReport',
        element: <CashDayPluckingReport />
      },
      {
        path: 'checkrollWorkDistributionReport',
        element: <CheckrollWorkDistributionReport />
      },
      {
        path: 'divisionwisedebts',
        element: <DivisionWiseDebtsReport />
      },
      {
        path: 'payroll/deductionReport',
        element: <PayrollDeductionReport />
      },

      {
        path: 'payrollDeduction',
        children: [
          { path: 'listing', element: <PayrollListing /> },
          {
            path: 'addEdit/:payrollDeductionID',
            element: <PayrollAddEdit />
          }
        ]
      },

      {
        path: 'ChildHeaderType',
        children: [
          { path: 'listing', element: <ChildHeaderTypeAddEdit/> },
          {
            path: 'addEdit/:payrollDeductionID',
            element: <ChildHeaderTypeAddEdit />
          }
        ]
      },

      {
        path: 'checkrollDateBlocker',
        element: <CheckrollDateBlocker />
      },
      {
        path: 'fixedDeductionReport',
        element: <FixedDeductionReport />
      }
    ]
  },
  {
    path: '/',
    //element: !isLoggedIn ? <MainLayout /> : <Navigate to='/app/dashboard' />,
    children: [
      { path: 'signin', element: <LoginView /> },
      { path: 'register', element: <RegisterView /> },
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/loader" /> },
      { path: 'loader', element: <Loader /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
