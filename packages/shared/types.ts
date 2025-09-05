export type ClockedOutState = {
  isClockedIn: false;
  workOptions: string[];
};

export type ClockedInState = {
  isClockedIn: true;
  clockInInfo: {
    userName: string;
    siteName: string;
    machineName: string;
    workDescription: string;
  };
};

export type NfcConfigResponse = ClockedOutState | ClockedInState;
