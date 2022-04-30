import { useState, useEffect } from "react";
import Axios from "axios";

export function useVersion() {
  const [version, setVersion] = useState("");
  useEffect(() => {
    Axios.get("/api/version").then((res) => {
      setVersion(res.data.result);
    });
  }, []);
  return { version };
}
