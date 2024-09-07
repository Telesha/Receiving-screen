export class AgriGenERPEnum {

    Title = {
        Mr: 1,
        Mrs: 2
    }

    Gender = {
        Male: 1,
        Female: 2
    }

    AdjustmentReason = {
        Expire: 1,
        Wastage: 2
    }

    FacItemAppprovalStatus = {
        Pending: 1,
        Issue: 2,
        Reject: 3,
        Send_To_Deliver: 4,
        Autherized: 5,
        Delivered: 6,
    }

    AdvancePaymentStatus = {
        Pending: 1,
        Approve: 2,
        Reject: 3,
        Delivered: 4
    }

    EntryType = {
        Cr: 1,
        Dr: 2
    }

    TransactionType = {
        Leaf: 1,
        Advance_Payment: 2,
        Factory_Item: 3,
        Advance_Payment_Return: 4,
        Balance_Credit: 5,
        Balance_Payment: 6,
        Transport_Rate: 7,
        Balance_Brought_Forward: 8,
        Balance_Carry_Forward: 9,
        Loan_Interest_Debit: 10,
        Loan_Principal_Debit: 11,
        Loan_Arrears_Fine: 12,
        Loan_Arrears_Interest: 13,
        Other_Loan_Instalment: 14,
        Other_Deductions: 15,
        Expay: 16,
        Ex_Deduction: 17,
        Stamp: 18,
        Statonery: 19,
        C_FDebts: 20,
        Ferti_Transport: 21,
        Savings: 22,
        Welfare: 23,
        B_FDebts: 24,
        // Fund_Deduction: 25,
        Credit_Note: 27,
        Debit_Note: 28,
        LedgerAccountOpeningBalance: 31,
        Debtror: 32,
        Addition: 33,
        Deduction: 34,
        Advance_Cheque: 35,
        Advance_Payment_Bank: 36
    }

    AdvancePaymentAppprovalStatus = {
        Pending: 1,
        Issue: 2,
        Reject: 3,
        Send_To_Deliver: 4,
        Autherized: 5,
        Delivered: 6
    }

    BalancePaymentStatus = {
        Pending: 1,
        Execution_Started: 2,
        Complete: 3
    }

    CustomerBalancePaymentStatus = {
        Pending: 1,
        Issued: 2,
        Ready_to_bank_process: 3,
        SLIP_Generating_Completed: 4,
        Cheque_Print_Process_Completed: 5,
    }

    CollectionTypeBalanceRateStatus = {
        Pending: 1,
        Approved: 2,
        Rejected: 3
    }

    CollectionTypeBalanceRateHistoryAction = {
        Edit: 1,
        Approved: 2,
        Rejected: 3
    }
    PaymentType = {
        Account: 1,
        Cheque: 2,
        Cash: 3
    }
    AdvanceRequestType = {
        MobileAdvance: 1,
        OverAdvance: 2,
        DirectAdvance: 3
    }
    LoanRequestStatus = {
        Pending: 1,
        Approved: 2,
        Rejected: 3,
        Issued: 4,
        Resheduled: 5,
        Hold: 6,
        EarlySettled: 7
    }

    FactoryItemRequestType = {
        MobileRequest: 1,
        DirectRequest: 2
    }

    FundDeductionMethod = {
        Percentage: 1,
        Flat: 2,
        Per_Kilo_Rate: 3
    }
    PayMode = {
        Cash: 1,
        Cheque: 2,
        Bank: 3
    }
    GeneralJournalStatus = {
        Pending: 1,
        Approved: 2,
        Rejected: 3
    }

    GLMappingStatusType = {
        Pending: 1,
        Approved: 2,
        Rejected: 3
    }

    LedgerAccountStatus = {
        Pending: 1,
        Approved: 2,
        Rejected: 3
    }

    FactoryItemMobileRequestStatus = {
        Pending: 1,
        Issue: 2,
        Reject: 3,
        Send_To_Deliver: 4,
    }

    SLIPFileStatus = {
        Downloaded: 1
    }

    CustomerSlabValue = {
        Less_Than_500: 1,
        Between_501_And_1000: 2,
        Greater_Than_1000: 3,
    }

    DispatchInvoiceStatus = {
        Catalogue: 1,
        Pending: 2,
        Shutout: 3,
        Sold: 4,
        UnSold: 5,
        Return: 6
    }

    ArrivalType = {
        Own_Estate: 1,
        Insourced: 2
    }

    CreditNoteStatus = {
        Pending: 1,
        Approved: 2,
        Rejected: 3,
        Send_To_Approve: 4
    }

    ManufacturingStatus = {
        All: 0,
        Pending: 1,
        Complete: 2
    }

    AdjustmentType = {
        Addition: 1,
        Deduction: 2
    }

    TypeOfPacks = {
        CHEST: 1,
        DJ_MWPS: 2,
        MWPS: 3,
        PS: 4,
        SPBS: 5
    }

    NatureOfDispatch = {
        Incomplete: 1,
        Complete: 2,
        Invoice: 3,
    }

    DailyCheckRollViewAmount = {
        OneKiloAmount: 50,
        OverKiloAmount: 60,
    }

    EmployeeSubCategory = {
        Department: 1,
        Section: 2,
        Division: 3
    }

    SessionNames = {
        Morning: 1,
        Noon: 2,
        Evening: 3,
        All: 4
    }

    GetjobTypeUsingJobID = {
        Cash: 1,
        Kilo: 2,
        General: 3,
        RSM: 4
    }

    EmployeeWorkTypeID = {
        DivisionLabour: 1,
        LentLabour: 2
    }
    EmployeeTypeID = {
        Register: 1,
        Unregisterd: 2
    }
    EmployeeJobCategoryID = {
        Weeding: 1,
        Fertilizing: 2
    }
    EmployeeJobID = {
        ManualWeeding: 1,
        ManualFertilizing: 2
    }
    JobTypeID = {
        Sundry: 1,
        Plucking: 2
    }

    EmployeeType = {
        Register: 1,
        Unregister: 2
    }
    EmployeeLeaveFormMorningHalf = {
        TimeFrom: '08:30',
        TimeTo: '12:30'
    }
    EmployeeLeaveFormEveningHalf = {
        TimeFrom: '12:30',
        TimeTo: '17:30'
    }

    ConfigurationType = {
        OT: 1,
        KiloRate: 2,
        NormValue: 3,
        HolidayPay: 4,
        Other: 5
    }
    Gradecategories = {
        MainGrade: 1,
        OffGrade: 2,
    }


    GradingCategoryID = {
        MainGrade: 1,
        OffGrade: 2
    }

    GradingTypeID = {
        Pekoe: 1,
        FBOP: 2,
        BOPF: 3,
        BP: 4,
        OP: 5,
        OPA: 6
    }

    InvoiceStatus = {
        Catalogue: 1,
        Pending: 2,
        Shutout: 3,
        Sold: 4,
        UnSold: 5,
        Return: 6,
        Received: 7,
        Valuate: 8
    }

    DispatchInvoiceApproval = {
        SendToApprove: 1,
        Approve: 2
    }

    TypeOfSalesID = {
        PublicSale: 1,
        PrivateSale: 2,
        Unsold: 3
    }

    FualTypeID = {
        Petrol: 1,
        Diesel: 2,
        Kerosene: 3,
        Gas: 4
    }

    ReturnTeaFrom = {
        Broker: 1,
        Buyer: 2
    }

    InvoiceStatusCode = {
        Return: 'RET',
        Withdraw: 'WIT'
    }

    LeafDeductionExecutionStatus = {
        Pending: 1,
        Execution_Started: 2,
        Complete: 3
    }

    TransportRateAdditionExecutionStatus = {
        Pending: 1,
        Execution_Started: 2,
        Complete: 3
    }
}