import { v4 as uuidv4 } from "uuid";
import papa from "papaparse";
import { PoolConnection } from "better-sqlite-pool";

// TODO create a shared types package
export interface Asset {
  id: string;
  client_id: string;
  latitude: number;
  longitude: number;
  address: string;
}

const getNumber = (x: unknown): number => {
  if (typeof x === "number") {
    return x;
  } else {
    throw new Error("data type mismatch");
  }
};

const getString = (x: unknown): string => {
  if (typeof x === "string") {
    return x;
  } else {
    throw new Error("data type mismatch");
  }
};

const isValidObject = (unsafeAsset: unknown): boolean =>
  typeof unsafeAsset === "object" &&
  !Array.isArray(unsafeAsset) &&
  unsafeAsset !== null;

const getSafeAsset = (unsafeAsset: unknown, clientId: string): Asset => {
  // check it's a valid object
  if (!isValidObject(unsafeAsset)) {
    throw new Error("data format error");
  }

  const latitude = getNumber(unsafeAsset["latitude"]);
  const longitude = getNumber(unsafeAsset["longitude"]);
  const address = getString(unsafeAsset["address"]);

  return {
    latitude,
    longitude,
    address,
    id: uuidv4(),
    client_id: clientId,
  };
};

const getAssetStatementBlock = (
  { id, client_id, latitude, longitude, address }: Asset,
  isFirst: boolean
): string =>
  (isFirst ? " " : " ,") +
  `('${id}', '${client_id}', '${latitude}', '${longitude}', '${address}')`;

export const getUploadAssetsStatement = (
  json: unknown[],
  clientId: string
): string => {
  let statement =
    "INSERT INTO assets (id, client_id, latitude, longitude, address) VALUES";

  // iterate through the json validating each row then transforming into the right sql and adding tothe statement
  json.forEach((unsafeAsset, i) => {
    statement += getAssetStatementBlock(
      getSafeAsset(unsafeAsset, clientId),
      i === 0
    );
  });

  statement += ";";
  return statement;
};

export const getAssets = (clientId?: string) => {
  const statement = clientId
    ? `SELECT * FROM assets WHERE client_id = '${clientId}'`
    : "SELECT * FROM assets";

  return (db: PoolConnection): Asset[] =>
    db.prepare(statement).all() as Asset[];
};

const isValidJSONArray = (array) => Array.isArray(array) && !!array.length;

export const getJSONArray = (file: Buffer) => {
  let array;
  try {
    array = JSON.parse(file.toString());

    if (isValidJSONArray(array)) {
      return array;
    } else {
      throw new Error();
    }
  } catch (e) {
    throw new Error("invalid json");
  }
};

export const getCSVData = (file: Buffer) => {
  const { data: array } = papa.parse(file.toString(), {
    dynamicTyping: true,
    header: true,
  });

  if (isValidJSONArray(array)) {
    return array;
  } else {
    throw new Error("invalid json");
  }
};
