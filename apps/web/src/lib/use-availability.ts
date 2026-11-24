import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availabilityApi } from "./availability-api";

const KEY = ["availability"];

export function useAvailability() {
    return useQuery({ queryKey: KEY, queryFn: availabilityApi.get });
};

export function useSaveAvailability() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: availabilityApi.save,
        // Server trả về bản đã chuẩn hoá, ghi thẳng vào cache thay vì gọi lại GET
        onSuccess: (intervals) => queryClient.setQueryData(KEY, intervals),
    });
};