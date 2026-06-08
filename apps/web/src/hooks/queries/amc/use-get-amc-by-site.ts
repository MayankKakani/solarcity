import { useQuery } from "@tanstack/react-query";
import getAmcBySite from "@/fetchers/amc/get-amc-by-site";

function useGetAmcBySite(siteId: string | null | undefined) {
  return useQuery({
    queryKey: ["amc", siteId],
    // biome-ignore lint/style/noNonNullAssertion: <ignore>
    queryFn: () => getAmcBySite(siteId!),
    enabled: !!siteId,
  });
}

export default useGetAmcBySite;
