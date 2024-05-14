import { searchUsersByName } from "@/api/users";
import SideBar from "@/components/ui/SideBar";
import { useAppSelector } from "@/hooks/hooks";
import { showToast } from "@/lib/utils";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const HomePage = () => {
  const user = useAppSelector((state) => state.auth?.user);
  const navigate = useNavigate();

  // search users query
  const searchUsersQuery = useQuery({
    queryFn: () => searchUsersByName(""),
    queryKey: ["users", "profile", "search", { name }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.log(err);
      showToast("error", err.response.data.error || err.message);
    },
  });

  return (
    <div>
      <h1>Hello {user?.name}</h1>
      {/* Sidebar */}
      <Sheet>
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SideBar
          user={user}
          users={searchUsersQuery.isSuccess ? searchUsersQuery.data.data : []}
          navigate={navigate}
        />
      </Sheet>
      {/* Sidebar Ends */}
    </div>
  );
};

export default HomePage;
