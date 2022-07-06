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