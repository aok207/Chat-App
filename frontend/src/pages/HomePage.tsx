import { postLogOut } from "@/api/users";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { logout } from "@/slices/authSlice";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: postLogOut,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.response.data.error || error.message,
      });
    },
    onSuccess: (data) => {
      dispatch(logout());
      navigate("/login");
      toast({
        title: data.message,
      });
    },
  });

  return (
    <div>
      <h1>Hello {user?.name}</h1>
      <button
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isLoading}
      >
        Log Out
      </button>
    </div>
  );
};

export default HomePage;
