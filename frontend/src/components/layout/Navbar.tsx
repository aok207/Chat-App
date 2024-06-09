/* eslint-disable @typescript-eslint/no-explicit-any */
import SideBar from "./SideBar";
import { UseQueryResult } from "react-query";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { UserType } from "@/types/types";
import SearchBar from "../search/SearchBar";

const Navbar = ({
  user,
  searchUsersQuery,
}: {
  user: UserType | null;
  searchUsersQuery: UseQueryResult<any, any>;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full gap-3 items-center h-full">
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
