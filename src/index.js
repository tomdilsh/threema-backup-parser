import { readFileSync, writeFileSync, readdirSync } from "fs";
import { parse } from "csv-parse/sync";
import { renderFile } from "ejs";

// how are first and last name displayed if set?
// how can we get '2 days ago' style dates?
// how far back does this day format go?
// csv fields in various message types?
// polls?
// custom command instead of npm ...

const MESSAGE_TYPES = {
  TEXT: "TEXT",
  FILE: "FILE",
  BALLOT: "BALLOT",
  LOCATION: "LOCATION",
  VOIP_STATUS: "VOIP_STATUS",
  GROUP_STATUS: "GROUP_STATUS",
  GROUP_CALL_STATUS: "GROUP_CALL_STATUS",
};

const THREAD_TYPE = {
  CONTACT: "CONTACT",
  GROUP: "GROUP",
  DISTRIBUTION: "DISTRIBUTION",
};

const getDateString = (date) =>
  date.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const CONTACT_MSG_CSV = /(message_)[\d]+(.csv)/;
const GROUP_MSG_CSV = /(group_message_)[\d]+(.csv)/;
const DISTRIBUTION_MSG_CSV = /(distribution_list_message_)[\d]+(.csv)/;
const ID_FROM_CSV = /\d+(?=\.csv)/;
const BALLOT_CSV = "ballot.csv";
const BALLOT_CHOICE_CSV = "ballot_choice.csv";
const BALLOT_VOTE_CSV = "ballot_vote.csv";
const CONTACTS_CSV = "contacts.csv";
const GROUPS_CSV = "groups.csv";
const DISTRIBUTION_LIST_CSV = "distribution_list.csv";
const DEFAULT_SENDER = "Me";

function getFileType(file) {
  if (DISTRIBUTION_MSG_CSV.test(file)) {
    return THREAD_TYPE.DISTRIBUTION;
  } else if (GROUP_MSG_CSV.test(file)) {
    return THREAD_TYPE.GROUP;
  } else {
    return THREAD_TYPE.CONTACT;
  }
}

function processFolder(input_folder) {
  const contacts = processContactMetadata(input_folder);
  const groups = processGroupMetadata(input_folder);
  const distributions = processDistributionMetadata(input_folder);

  const messageSets = [];

  readdirSync(input_folder).forEach((file) => {
    if (CONTACT_MSG_CSV.test(file)) {
      const messages = processFile(`${input_folder}/${file}`);
      if (Object.keys(messages).length) {
        const id = ID_FROM_CSV.exec(file)[0];
        const type = getFileType(file);
        const set = {
          messages,
          type,
        };
        if (type === THREAD_TYPE.CONTACT) {
          set.avatar = `contact_avatar_${id}`;
          set.recipient = contacts[id].nick_name;
        } else if (type === THREAD_TYPE.GROUP) {
          set.avatar = `group_avatar_${id}`;
          set.group_name = groups[id].groupname;
          set.members = groups[id].members.map(
            (m) => contacts[m]?.nick_name || DEFAULT_SENDER
          );
        } else if (type === THREAD_TYPE.DISTRIBUTION) {
          set.avatar = `distribution_list_avatar_${id}`;
          set.distribution_name = distributions[id].distribution_list_name;
          set.members = distributions[id].distribution_members.map(
            (m) => contacts[m]?.nick_name || DEFAULT_SENDER
          );
        }
        messageSets.push(set);
      }
    }
  });
  // return messageSets;

  const style = readFileSync("src/styles/style.css").toString();

  renderFile(
    "src/templates/main.ejs",
    { messageSets, style },
    { rmWhitespace: true },
    (err, str) => {
      writeFileSync(`test.html`, str);
    }
  );
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
      "id",
      "id2",
      "type",
      "size",
      "filename",
      null,
      null,
      "text",
      "thumbnail_type",
    ],
    skip_empty_lines: true,
  })[0];
  parsed["dimensions"] = cleaned.at(-1);
  return parsed;
}

function parseLocationInfo(body) {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["latitude", "longitude", "something", "name", "name2"],
    skip_empty_lines: true,
  })[0];
  return parsed;
}

function parsePollInfo(body) {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["one", "two"],
    skip_empty_lines: true,
  })[0];
  return parsed;
}

function processContactMetadata(folder) {
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

function processGroupMetadata(folder) {
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

function processDistributionMetadata(folder) {
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

processFolder("threema-backup");
// writeFileSync("test.json", JSON.stringify(processFolder("threema-backup")));
