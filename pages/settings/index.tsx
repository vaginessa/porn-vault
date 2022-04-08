import { useEffect, useState } from "react";
import prettyBytes from "pretty-bytes";

import Card from "../../components/Card";
import { getFullStatus, StatusData, ServiceStatus } from "../../util/status";
import CardTitle from "../../components/CardTitle";
import { useTranslations } from "next-intl";
import CardSection from "../../components/CardSection";

export default function SettingsPage() {
  const t = useTranslations();
  const [status, setStatus] = useState<StatusData>({
    izzy: {
      status: ServiceStatus.Unknown,
      version: "unknown",
      collections: [],
      collectionBuildInfoMap: {},
      allCollectionsBuilt: false,
    },
    elasticsearch: {
      status: ServiceStatus.Unknown,
      version: "unknown",
      indices: [],
      indexBuildInfoMap: {},
      allIndexesBuilt: false,
    },
    serverUptime: 0,
    osUptime: 0,
    serverReady: false,
  });

  async function fetchData() {
    try {
      const res = await getFullStatus();
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 20 }}>
      <CardTitle>{t("settings")}</CardTitle>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", maxWidth: 1000 }}
      >
        <Card>
          <CardTitle>Izzy (database)</CardTitle>
          <CardSection title={t("status")}>
            <div style={{ opacity: 0.66 }}>{status.izzy.status}</div>
          </CardSection>
          <CardSection title={t("version")}>
            <div style={{ opacity: 0.66 }}>{status.izzy.version}</div>
          </CardSection>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Document count</th>
                </tr>
              </thead>
              <tbody>
                {status.izzy.collections.map((collection) => (
                  <tr>
                    <td>{collection.name}</td>
                    <td title={`${collection.size} bytes`}>
                      {prettyBytes(collection.size / 1000)}
                    </td>
                    <td>{collection.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardTitle>Elasticsearch</CardTitle>
          <CardSection title={t("status")}>
            <div style={{ opacity: 0.66 }}>{status.elasticsearch.status}</div>
          </CardSection>
          <CardSection title={t("version")}>
            <div style={{ opacity: 0.66 }}>{status.elasticsearch.version}</div>
          </CardSection>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Health</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Document count</th>
                </tr>
              </thead>
              <tbody>
                {status.elasticsearch.indices.map((index) => (
                  <tr>
                    <td>{index.index}</td>
                    <td style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div
                        style={{
                          borderRadius: "50%",
                          backgroundColor: index.health,
                          border: "1px solid grey",
                          width: 16,
                          height: 16,
                        }}
                      />
                      {index.health}
                    </td>
                    <td>{index.status}</td>
                    <td>{index["store.size"]}</td>
                    <td>{index["docs.count"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
