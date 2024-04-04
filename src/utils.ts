import {
  DEFAULT_SENDER,
  DISTRIBUTION_MSG_CSV,
  FILE_SUBTYPE,
  GROUP_MSG_CSV,
  THREAD_TYPE,
} from "./constants";
import { ContactMetadata } from "./types";

export const getContactAvatar = (id: string | number) => `contact_avatar_${id}`;
export const getGroupAvatar = (id: string | number) => `group_avatar_${id}`;
export const getDistributionAvatar = (id: string | number) =>
  `distribution_list_avatar_${id}`;

export const getNewDayString = (date: Date) =>
  date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const getDisplayName = (contact: ContactMetadata) => {
  return (
    `${contact?.firstname} ${contact?.lastname}`.trim() ||
    contact?.nick_name ||
    DEFAULT_SENDER
  );
};

export const getFileType = (file: string) => {
  if (DISTRIBUTION_MSG_CSV.test(file)) {
    return THREAD_TYPE.DISTRIBUTION;
  } else if (GROUP_MSG_CSV.test(file)) {
    return THREAD_TYPE.GROUP;
  } else {
    return THREAD_TYPE.CONTACT;
  }
};

export const getFileSubtype = (mimeType: string) => {
  const type = mimeType.split("/")[0];

  switch (type) {
    case "image":
      return FILE_SUBTYPE.IMAGE;
    case "video":
      return FILE_SUBTYPE.VIDEO;
    case "audio":
      return FILE_SUBTYPE.AUDIO;
    case "application":
      if (mimeType === "application/pdf") {
        return FILE_SUBTYPE.PDF;
      }
      return FILE_SUBTYPE.OTHER;
    case "text":
      if (mimeType === "text/x-vcard") {
        return FILE_SUBTYPE.CONTACT;
      }
      return FILE_SUBTYPE.TEXT;
    default:
      return FILE_SUBTYPE.OTHER;
  }
};
