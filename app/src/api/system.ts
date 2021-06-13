import { StatusData } from "../types/status";
import Axios, { AxiosResponse } from "axios";

export function getStatus(): Promise<AxiosResponse<StatusData>> {
  return Axios.get<StatusData>("/api/system/status", {
    params: { password: localStorage.getItem("password") },
  });
}
