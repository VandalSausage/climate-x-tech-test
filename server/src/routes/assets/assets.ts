import express from "express";
import { query } from "../../conn";

import multer from "multer";
import {
  getAssets,
  getUploadAssetsStatement,
  getJSONArray,
  getCSVData,
} from "./helpers";

export const assets = express.Router();
// to keep this simple I'm putting the entire file in memory
const storage = multer.memoryStorage();
// set file size limit at 10kb
const fileLimit = 1024 * 10;
const upload = multer({ storage, limits: { fileSize: fileLimit } });

assets.get("/", async (request, response) => {
  try {
    const clientId = request.query["Client-Id"] as string;
    response.appendHeader("Content-Type", "application/json");
    const resp = await query(getAssets(clientId));
    response.status(200).json(resp);
  } catch (e) {
    console.error(e);
    response.status(500).json({
      message: "something went wrong",
    });
  }
});

assets.post("/upload", upload.single("assets"), async (request, response) => {
  response.appendHeader("Content-Type", "application/json");
  try {
    if (!request.body.client_id) {
      response.status(400).json({
        message: "missing client id",
      });
    } else if (!request.file) {
      response.status(400).json({
        message: "missing upload file",
      });
    } else if (
      request.file.mimetype !== "application/json" &&
      request.file.mimetype !== "text/csv"
    ) {
      response.status(400).json({ message: "unknown file format" });
    } else {
      let statement;
      switch (request.file.mimetype) {
        case "application/json":
          statement = getUploadAssetsStatement(
            getJSONArray(request.file.buffer),
            request.body.client_id
          );
          break;
        case "text/csv":
          statement = getUploadAssetsStatement(
            getCSVData(request.file.buffer),
            request.body.client_id
          );
      }

      const resp = await query((db) => {
        const { changes } = db.prepare(statement).run();
        return changes;
      });

      response.status(200).json({ message: `assets created: ${resp}` });
    }
  } catch (e) {
    console.error(e);
    response.status(500).json({
      message: "something went wrong",
    });
  }
});
