import {
  DEFAULT_SENDER,
  DISTRIBUTION_MSG_CSV,
  FILE_SUBTYPE,
  GROUP_MSG_CSV,
  THREAD_TYPE,
} from "./constants.js";

export const getContactAvatar = (id) => `contact_avatar_${id}`;
export const getGroupAvatar = (id) => `group_avatar_${id}`;
export const getDistributionAvatar = (id) => `distribution_list_avatar_${id}`;

export const getDisplayName = (contact) => {
  return (
    `${contact?.firstname} ${contact?.lastname}`.trim() ||
    contact?.nick_name ||
    DEFAULT_SENDER
  );
};

export const getDateString = (date) =>
  date.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getFileType = (file) => {
  if (DISTRIBUTION_MSG_CSV.test(file)) {
    return THREAD_TYPE.DISTRIBUTION;
  } else if (GROUP_MSG_CSV.test(file)) {
    return THREAD_TYPE.GROUP;
  } else {
    return THREAD_TYPE.CONTACT;
  }
};

export const getFileSubtype = (mimeType) => {
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
