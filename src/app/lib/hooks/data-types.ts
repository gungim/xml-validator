import { useQuery } from "@tanstack/react-query";
import { getDataTypes } from "../api/data-types";

export function useDataTypes() {
  return useQuery({
    queryKey: ["dataTypes"],
    queryFn: () => getDataTypes(),
    staleTime: Infinity, // Data types don't change, cache forever
  });
}
