import { readFileSync, readdirSync } from "fs";
import { parse } from "csv-parse/sync";
import {
  CONTACTS_CSV,
  CONTACT_MSG_CSV,
  DISTRIBUTION_LIST_CSV,
  GROUPS_CSV,
  ID_FROM_CSV,
  MESSAGE_TYPES,
  THREAD_TYPE,
} from "./constants.js";
import {
  getContactAvatar,
  getDateString,
  getDisplayName,
  getFileSubtype,
  getFileType,
  getGroupAvatar,
} from "./utils.js";
import { renderHTML } from "./render.js";

// how can we get '2 days ago' style dates?
// how far back does this day format go?
// csv fields in various message types?
// polls?

export function processFolder(input_folder) {
  const contacts = parseContactMetadata(input_folder);
  const groups = parseGroupMetadata(input_folder);
  const distributions = parseDistributionMetadata(input_folder);

  const messageSets = [];

  readdirSync(input_folder).forEach((file) => {
    if (CONTACT_MSG_CSV.test(file)) {
      const messages = processFile(`${input_folder}/${file}`);
      if (Object.keys(messages).length) {
        const id = ID_FROM_CSV.exec(file)[0];
        const type = getFileType(file);
        const filename = file.replace(".csv", "");
        const set = {
          messages,
          filename,
          type,
          id,
        };
        processThreadType(set, contacts, groups, distributions);
        messageSets.push(set);
      }
    }
  });
  renderHTML(input_folder, messageSets);
}

function processFile(input_path) {
  const csv = readFileSync(input_path);
  const messages = parse(csv, { columns: true, skip_empty_lines: true }).reduce(
    (obj, item) => {
      obj[item.apiid || item.uid] = item;
      return obj;
    },
    {}
  );

  for (const key in messages) {
    processMessage(messages[key]);
  }
  return messages;
}

function processThreadType(set, contacts, groups, distributions) {
  switch (set.type) {
    case THREAD_TYPE.CONTACT:
      set.avatar = getContactAvatar(set.id);
      set.recipient = contacts[set.id].nick_name;
      break;
    case THREAD_TYPE.GROUP:
      set.avatar = getGroupAvatar(set.id);
      set.group_name = groups[set.id].groupname;
      set.members = groups[set.id].members.map((m) =>
        getDisplayName(contacts[m])
      );
      break;
    case THREAD_TYPE.DISTRIBUTION:
      set.avatar = getDistributionAvatar(set.id);
      set.distribution_name = distributions[set.id].distribution_list_name;
      set.members = distributions[set.id].distribution_members.map((m) =>
        getDisplayName(contacts[m])
      );
      break;
  }
}

function processMessage(entry) {
  const jsDate = new Date(+entry.posted_at);
  entry.formatted_date = `${getDateString(jsDate)} ${jsDate.toLocaleTimeString(
    "en-us"
  )}`;

  switch (entry.type) {
    case MESSAGE_TYPES.FILE:
      entry.file_info = parseFileInfo(entry.body);
      break;
    case MESSAGE_TYPES.LOCATION:
      entry.location_info = parseLocationInfo(entry.body);
      break;
    case MESSAGE_TYPES.BALLOT:
      entry.ballot_info = parsePollInfo(entry.body);
      break;
    case MESSAGE_TYPES.VOIP_STATUS:
      break;
  }
}

function parseFileInfo(body) {
  const cleaned = JSON.parse(body);
  const parsed = parse(cleaned.slice(0, -1).join(","), {
    columns: [
      null,
      null,
      "mimeType",
      "size",
      "filename",
      "displayable",
      null,
      "text",
      null,
    ],
    skip_empty_lines: true,
  })[0];
  parsed["dimensions"] = cleaned.at(-1);
  parsed["subtype"] = getFileSubtype(parsed.mimeType);
  return parsed;
}

function parseLocationInfo(body) {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["latitude", "longitude", null, "name", null],
    skip_empty_lines: true,
  })[0];
  return parsed;
}

function parsePollInfo(body) {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["?", "??"],
    skip_empty_lines: true,
  })[0];
  return parsed;
}

function parseContactMetadata(folder) {
  const csv = readFileSync(`${folder}/${CONTACTS_CSV}`);
  const contacts = parse(csv, { columns: true, skip_empty_lines: true }).reduce(
    (obj, item) => {
      obj[item.identity_id] = item;
      obj[item.identity] = item;
      return obj;
    },
    {}
  );
  return contacts;
}

function parseGroupMetadata(folder) {
  const csv = readFileSync(`${folder}/${GROUPS_CSV}`);
  const groups = parse(csv, { columns: true, skip_empty_lines: true }).reduce(
    (obj, item) => {
      obj[item.group_uid] = item;
      return obj;
    },
    {}
  );
  for (const key in groups) {
    groups[key].members = groups[key].members.split(";");
  }
  return groups;
}

function parseDistributionMetadata(folder) {
  const csv = readFileSync(`${folder}/${DISTRIBUTION_LIST_CSV}`);
  const distributions = parse(csv, {
    columns: true,
    skip_empty_lines: true,
  }).reduce((obj, item) => {
    obj[item.id] = item;
    return obj;
  }, {});
  for (const key in distributions) {
    distributions[key].distribution_members =
      distributions[key].distribution_members.split(";");
  }
  return distributions;
}

// function parseBallots(folder) {
//   let csv = readFileSync(`${folder}/${BALLOT_CSV}`);
//   const ballots = parse(csv, { columns: true, skip_empty_lines: true }).reduce(
//     (obj, item) => {
//       obj[item.apiid || item.uid] = item;
//       return obj;
//     },
//     {}
//   );
//   csv = readFileSync(`${folder}/${BALLOT_CHOICE_CSV}`);
//   const ballot_choices = parse(csv, {
//     columns: true,
//     skip_empty_lines: true,
//   }).reduce((obj, item) => {
//     obj[item.apiid || item.uid] = item;
//     return obj;
//   }, {});
//   csv = readFileSync(`${folder}/${BALLOT_VOTE_CSV}`);
//   const ballot_votes = parse(csv, {
//     columns: true,
//     skip_empty_lines: true,
//   }).reduce((obj, item) => {
//     obj[item.apiid || item.uid] = item;
//     return obj;
//   }, {});
// }
