export enum COLOR_SCHEME {
  Dark = "dark",
  Light = "light",
}

export enum THREAD_TYPE {
  CONTACT = "CONTACT",
  GROUP = "GROUP",
  DISTRIBUTION = "DISTRIBUTION",
}

export enum THREAD_ENTRY_TYPE {
  TEXT = "TEXT",
  FILE = "FILE",
  BALLOT = "BALLOT",
  LOCATION = "LOCATION",
  VOIP_STATUS = "VOIP_STATUS",
  GROUP_STATUS = "GROUP_STATUS",
  GROUP_CALL_STATUS = "GROUP_CALL_STATUS",
}

export enum FILE_SUBTYPE {
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
  CONTACT = "CONTACT",
  TEXT = "TEXT",
  PDF = "PDF",
  OTHER = "OTHER",
}

export const CONTACT_MSG_CSV = /(message_)[\d]+(.csv)/;
export const GROUP_MSG_CSV = /(group_message_)[\d]+(.csv)/;
export const DISTRIBUTION_MSG_CSV = /(distribution_list_message_)[\d]+(.csv)/;
export const ID_FROM_CSV = /\d+(?=\.csv)/;
export const BALLOT_CSV = "ballot.csv";
export const BALLOT_CHOICE_CSV = "ballot_choice.csv";
export const BALLOT_VOTE_CSV = "ballot_vote.csv";
export const CONTACTS_CSV = "contacts.csv";
export const GROUPS_CSV = "groups.csv";
export const DISTRIBUTION_LIST_CSV = "distribution_list.csv";
export const DEFAULT_SENDER = "Me";
export const OUTPUT_FOLDER = "output";
