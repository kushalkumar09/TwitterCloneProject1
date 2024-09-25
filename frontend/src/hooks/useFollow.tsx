import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


const useFollowUnfollow = () => {
  const queryClient = useQueryClient();

  const { mutate: followUnfollow, isPending } = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/user/follow/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "An error occurred");
      }
      return data;
    },
    onSuccess: () => {
      Promise.all(
        [
            queryClient.invalidateQueries({queryKey:["authenticatedUser"]}),
            queryClient.invalidateQueries({queryKey:["suggestedUser"]})
        ]
      )
      toast.success("Follow status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return {
    followUnfollow,
    isPending
  };
};

export default useFollowUnfollow;