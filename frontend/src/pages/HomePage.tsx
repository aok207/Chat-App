import { postLogOut } from "@/api/users";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { showToast } from "@/lib/utils";
import { logout } from "@/slices/authSlice";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: postLogOut,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      showToast("error", error.response.data.error || error.message);
    },
    onSuccess: (data) => {
      dispatch(logout());
      navigate("/login");
      showToast("success", data.message);
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
