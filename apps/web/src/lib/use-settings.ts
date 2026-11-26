import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "./settings-api";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    // Cập nhật luôn dữ liệu người dùng đang được cache (tên ở thanh trên, v.v.)
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
}