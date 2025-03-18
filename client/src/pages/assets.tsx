import { useQuery } from "@tanstack/react-query";

import { processRequest } from "../api-service";
import { useState } from "react";

// TODO create a shared types package
interface Asset {
  id: string;
  client_id: string;
  latitude: number;
  longitude: number;
  address: string;
}

export const Assets = () => {
  const [clientId, setClientId] = useState("");
  const { isPending, error, data, refetch } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: async () =>
      processRequest({
        path: "assets",
        params: {
          "Client-Id": clientId,
        },
      }),
  });

  if (isPending) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>{`error: ${error.message}`}</div>;
  }

  return (
    <>
      <div className="search-area">
        <div className="search-input">
          <label htmlFor="client_id">Search a Client Id</label>
          <input
            disabled={isPending}
            name="client_id"
            id="client_id"
            onBlur={(e) => {
              setClientId(e.target.value);
            }}
          />
        </div>

        <button
          className="search-button"
          onClick={() => {
            refetch();
          }}
        >
          Search
        </button>
      </div>
      <div className="layout">
        <h1 className="header">Assets</h1>
        <h3 className="header">
          {clientId
            ? `Showing assets for client: ${clientId}`
            : "Showing all assets"}
        </h3>

        {data.length ? (
          <table className="asset-table">
            <tbody>
              <tr>
                <th>Address</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
              {data.map(({ latitude, longitude, address, id }) => (
                <tr key={id}>
                  <td className="table-cell">{address}</td>
                  <td className="table-cell">{latitude}</td>
                  <td className="table-cell">{longitude}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <h3 className="header">There are no saved assets</h3>
        )}
      </div>
    </>
  );
};
