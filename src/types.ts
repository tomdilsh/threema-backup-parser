import { THREAD_ENTRY_TYPE, THREAD_TYPE } from "./constants";

export interface ThreadSet {
  entries: Record<string, ThreadEntry>;
  avatar?: string;
  title?: string;
  members?: string[];
  filename: string;
  type: THREAD_TYPE;
  id: number;
}

export interface ThreadEntry {
  apiid: string;
  uid: string;
  isoutbox?: number;
  isread?: number;
  issaved?: number;
  messagestae?: string;
  posted_at: number;
  created_at: number;
  modified_at: number;
  type: THREAD_ENTRY_TYPE;
  body: string;
  isstatusmessage?: number;
  isqueued?: number;
  caption?: string;
  quoted_message_apiid?: string;
  delivered_at: number;
  read_at: number;
  g_msg_states?: string;
  display_tags?: number;
  file_info?: FileInfo;
  location_info: LocationInfo;
  ballot_info: BallotInfo;
}

export interface FileInfo {
  mimeType: string;
  size: number;
  filename: string;
  displayable: boolean;
  text: string;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  name: string;
}

export interface BallotInfo {
  "?": number;
  "??": number;
}

export interface ContactMetadata {
  identity: string;
  publickey: string;
  verification: string;
  acid: string;
  tacid: string;
  firstname: string;
  lastname: string;
  nick_name: string;
  hidden: number;
  archived: number;
  identity_id: number;
}

export interface GroupMetadata {
  id: string;
  creator: string;
  groupname: string;
  created_at: number;
  members: string[];
  deleted: number;
  archived: number;
  groupDesc: string;
  groupDescTimestamp: number;
  group_uid: number;
}

export interface DistributionMetadata {
  id: number;
  distribution_list_name: string;
  created_at: number;
  distribution_members: string[];
  archived: number;
}
