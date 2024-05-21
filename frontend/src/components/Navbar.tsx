/* eslint-disable @typescript-eslint/no-explicit-any */
import SideBar from "@/components/SideBar";
import { UseQueryResult } from "react-query";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserType } from "@/types/types";
import SearchBar from "./SearchBar";

const Navbar = ({
  user,
  searchUsersQuery,
}: {
  user: UserType | null;
  searchUsersQuery: UseQueryResult<any, any>;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full gap-3">
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
      <SearchBar />
    </div>
  );
};

export default Navbar;
