export class CreateDomaineventsDto {
  

    readonly _id: { oid:String;  };
    readonly aggregateIdentifier: String;
    readonly  type: String;
    readonly  sequenceNumber: {numberLong:String};
    readonly  serializedPayload: String;
    readonly  timestamp: String;
    readonly  payloadType: String;
    readonly  payloadRevision: String;
    readonly  serializedMetaData: String;
    readonly eventIdentifier:String;
  }