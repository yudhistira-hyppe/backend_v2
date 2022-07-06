export class OyDisburseCallback {
  
    status:                Status;
    tx_status_description: string;
    amount:                number;
    recipient_name:        string;
    recipient_bank:        string;
    recipient_account:     string;
    trx_id:                string;
    partner_trx_id:        string;
    timestamp:             string;
    created_date:          string;
    last_updated_date:     string;
  }

export class Status {
    code:    string;
    message: string;
}

export class OyVaCallback {
  va_number: string;
  amount: number;
  partner_user_id: string;
  success: boolean;
  tx_date: string;
  username_display: string;
  trx_expiration_date: string;
  partner_trx_id: string;
  trx_id: string;
  settlement_time: string;
  settlement_status: string;
}

export class OyAccountInquiry {
  bank_code: string;
  account_number: string;
}

export class OyAccountInquiryResponse {
  status: Status;
  bank_code: string;
  account_number: string;
  account_name: string;
  timestamp: Date;
  id: string;
  invoice_id: string;
}

export class OyDisbursement {
  recipient_bank: string;
  recipient_account: string;
  amount: number;
  note: string;
  partner_trx_id: string;
  email: string;
}

export class OyDisbursementResponse {
  status: Status;
  amount: number;
  timestamp: string;
  recipient_bank: string;
  recipient_account: string;
  trx_id: string;
  partner_trx_id: string;
}

export class OyDisbursementStatus {
  email: string;
}

export class OyDisbursementStatusResponse {
  status: Status;
  amount: number;
  timestamp: string;
  tx_status_description?: any;
  recipient_name: string;
  recipient_bank: string;
  recipient_account: string;
  trx_id: string;
  partner_trx_id: string;
  created_date: string;
  last_updated_date: string;
}


export class OyMyBalanceResponse {
  status: Status;
  balance: number;
  overdraftBalance: number;
  overbookingBalance: number;
  pendingBalance: number;
  availableBalance: number;
  timeStamp: string;
}

export class OyStaticVa {
  partner_user_id: string;
  amount: number;
  bank_code: string;
  is_open: boolean;
  is_single_use: boolean;
  is_lifetime: boolean;
  username_display: string;
  email: string;
}

export class OyStaticVaResponse {
  id: string;
  amount: number;
  status: Status;
  va_number: string;
  bank_code: string;
  is_open: boolean;
  is_single_use: boolean;
  expiration_time: number;
  va_status: string;
  username_display: string;
  partner_user_id: string;
  counter_incoming_payment: number;
  trx_expiration_time: number;
  trx_counter: number;
}


export class OyStaticVAInfo {
  id: string;
  amount: number;
  status: Status;
  va_number: string;
  bank_code: string;
  is_open: boolean;
  is_single_use: boolean;
  expiration_time: number;
  va_status: string;
  username_display: string;
  partner_user_id: string;
  counter_incoming_payment: number;
  trx_expiration_time: number;
  trx_counter: number;
}