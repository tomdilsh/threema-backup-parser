import { readFileSync, readdirSync } from "fs";
import { parse } from "csv-parse/sync";
import {
  COLOR_SCHEME,
  CONTACTS_CSV,
  CONTACT_MSG_CSV,
  DISTRIBUTION_LIST_CSV,
  GROUPS_CSV,
  ID_FROM_CSV,
  THREAD_ENTRY_TYPE,
  THREAD_TYPE,
} from "./constants";
import {
  getContactAvatar,
  getDisplayName,
  getDistributionAvatar,
  getFileSubtype,
  getFileType,
  getGroupAvatar,
  getNewDayString,
} from "./utils";
import { renderHTML } from "./render";
import {
  BallotInfo,
  ContactMetadata,
  DistributionMetadata,
  FileInfo,
  GroupMetadata,
  LocationInfo,
  ThreadEntry,
  ThreadSet,
} from "./types";

export function processFolder(inputFolder: string, colorScheme: COLOR_SCHEME) {
  const contacts = parseContactMetadata(inputFolder);
  const groups = parseGroupMetadata(inputFolder);
  const distributions = parseDistributionMetadata(inputFolder);

  const entrySets: ThreadSet[] = [];

  readdirSync(inputFolder).forEach((file) => {
    if (CONTACT_MSG_CSV.test(file)) {
      const entries = processFile(`${inputFolder}/${file}`);
      if (Object.keys(entries).length) {
        const id = +(ID_FROM_CSV?.exec(file)?.[0] || 0);
        const type = getFileType(file);
        const filename = file.replace(".csv", "");
        const set = {
          entries,
          filename,
          type,
          id,
        };
        processThreadType(set, contacts, groups, distributions);
        entrySets.push(set);
      }
    }
  });
  renderHTML(inputFolder, entrySets, colorScheme);
}

function processFile(inputPath: string): Record<string, ThreadEntry> {
  const csv = readFileSync(inputPath);
  const entries = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  }).reduce((obj: Record<string, ThreadEntry>, item: ThreadEntry) => {
    obj[item.apiid || item.uid] = item;
    return obj;
  }, {});

  let last = "";
  for (const key in entries) {
    if (
      new Date(entries[key]?.posted_at).getDay() !==
      new Date(entries[last]?.posted_at).getDay()
    ) {
      entries[key].new_date = getNewDayString(
        new Date(entries[key]?.posted_at)
      ).toUpperCase();
    }
    processThreadEntry(entries[key]);
    last = key;
  }
  return entries;
}

function processThreadType(
  set: ThreadSet,
  contacts: Record<number | string, ContactMetadata>,
  groups: Record<number, GroupMetadata>,
  distributions: Record<number, DistributionMetadata>
) {
  switch (set.type) {
    case THREAD_TYPE.CONTACT:
      set.avatar = getContactAvatar(set.id);
      set.title = getDisplayName(contacts[set.id]);
      break;
    case THREAD_TYPE.GROUP:
      set.avatar = getGroupAvatar(set.id);
      set.title = groups[set.id].groupname;
      set.members = groups[set.id].members.map((m) =>
        getDisplayName(contacts[m])
      );
      break;
    case THREAD_TYPE.DISTRIBUTION:
      set.avatar = getDistributionAvatar(set.id);
      set.title = distributions[set.id].distribution_list_name;
      set.members = distributions[set.id].distribution_members.map((m) =>
        getDisplayName(contacts[m])
      );
      break;
  }
}

function processThreadEntry(entry: ThreadEntry) {
  entry.formatted_date = new Date(entry.posted_at).toLocaleTimeString("en-us");
  switch (entry.type) {
    case THREAD_ENTRY_TYPE.FILE:
      entry.file_info = parseFileInfo(entry.body);
      break;
    case THREAD_ENTRY_TYPE.LOCATION:
      entry.location_info = parseLocationInfo(entry.body);
      break;
    case THREAD_ENTRY_TYPE.BALLOT:
      entry.ballot_info = parseBallotInfo(entry.body);
      break;
    case THREAD_ENTRY_TYPE.VOIP_STATUS:
      break;
  }
}

function parseFileInfo(body: string): FileInfo {
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
    cast: true,
  })[0];
  parsed["dimensions"] = cleaned.at(-1);
  parsed["subtype"] = getFileSubtype(parsed.mimeType);
  return parsed;
}

function parseLocationInfo(body: string): LocationInfo {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["latitude", "longitude", null, "name", null],
    skip_empty_lines: true,
    cast: true,
  })[0];
  return parsed;
}

function parseBallotInfo(body: string): BallotInfo {
  const parsed = parse(JSON.parse(body).join(","), {
    columns: ["?", "??"],
    skip_empty_lines: true,
    cast: true,
  })[0];
  return parsed;
}

function parseContactMetadata(
  folder: string
): Record<string | number, ContactMetadata> {
  const csv = readFileSync(`${folder}/${CONTACTS_CSV}`);
  const contacts = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  }).reduce(
    (obj: Record<string | number, ContactMetadata>, item: ContactMetadata) => {
      obj[item.identity_id] = item;
      obj[item.identity] = item;
      return obj;
    },
    {}
  );
  return contacts;
}

function parseGroupMetadata(folder: string): Record<number, GroupMetadata> {
  const csv = readFileSync(`${folder}/${GROUPS_CSV}`);
  const groups = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  }).reduce((obj: Record<number, GroupMetadata>, item: GroupMetadata) => {
    obj[item.group_uid] = item;
    return obj;
  }, {});
  for (const key in groups) {
    groups[key].members = groups[key].members.split(";");
  }
  return groups;
}

function parseDistributionMetadata(
  folder: string
): Record<number, DistributionMetadata> {
  const csv = readFileSync(`${folder}/${DISTRIBUTION_LIST_CSV}`);
  const distributions = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  }).reduce(
    (obj: Record<number, DistributionMetadata>, item: DistributionMetadata) => {
      obj[item.id] = item;
      return obj;
    },
    {}
  );
  for (const key in distributions) {
    distributions[key].distribution_members =
      distributions[key].distribution_members.split(";");
  }
  return distributions;
}
