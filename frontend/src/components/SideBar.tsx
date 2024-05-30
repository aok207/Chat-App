/* eslint-disable @typescript-eslint/no-explicit-any */
import { SheetContent, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { cn, showToast } from "@/lib/utils";
import { ChangeEvent, FormEvent, useState } from "react";
import {
  Edit,
  X,
  Check,
  LogOutIcon,
  SettingsIcon,
  Moon,
  UsersRound,
} from "lucide-react";
import { Input } from "./ui/input";
import { updateUserInfo } from "@/api/users";
import { postLogOut } from "@/api/auth";
import { useMutation } from "react-query";
import { useDispatch } from "react-redux";
import { login, logout } from "@/slices/authSlice";
import Spinner from "./ui/spinner";
import { Button } from "./ui/button";
import { Link, NavigateFunction } from "react-router-dom";
import { Switch } from "./ui/switch";
import { useTheme } from "./theme-provider";
import { Separator } from "@/components/ui/separator";
import { UserType } from "@/types/types";
import Avatar from "./Avatar";
import { socket } from "@/sockets/sockets";

type SideBarProps = {
  user: UserType | null;
  users: UserType[] | [];
  navigate: NavigateFunction;
};

const menus = [
  {
    icon: <UsersRound />,
    link: "/new-group",
    text: "New Group",
  },
  {
    icon: <SettingsIcon />,
    link: "/settings",
    text: "Settings",
  },
];

const SideBar = ({ user, users, navigate }: SideBarProps) => {
  const [isNameInEditMode, setIsNameInEditMode] = useState(false);
  const [name, setName] = useState(user?.name);
  const dispatch = useDispatch();

  const { theme, setTheme } = useTheme();

  const updateUsernameMutation = useMutation({
    mutationFn: updateUserInfo,
    onError: (error: any) => {
      showToast("error", error.response.data.error || error.message);
    },
    onSuccess: (data) => {
      dispatch(login(data.data));
      showToast("success", "Username updated successfully!");
      setIsNameInEditMode(false);
    },
  });

  const handleChangeUsername = (e: FormEvent) => {
    e.preventDefault();

    if (name === "") {
      showToast("error", "Username cannot be empty!");
      return;
    }

    if (!(users.filter((user) => user?.name === name).length === 0)) {
      showToast("error", "Username is already taken!");
      return;
    }

    updateUsernameMutation.mutate({ name });
  };

  // handle log out
  const logoutMutation = useMutation({
    mutationFn: postLogOut,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      showToast("error", error.response.data.error || error.message);
    },
    onSuccess: (data) => {
      dispatch(logout());
      socket.disconnect();
      navigate("/login");
      showToast("success", data.message);
    },
  });

  return (
    <SheetContent side="left" className={cn("text-black dark:text-white")}>
      <SheetHeader className={cn("flex flex-col justify-between h-full")}>
        <div className="flex flex-col items-start justify-center gap-4 w-full">
          <div className="flex gap-3 items-center ml-3 group">
            <Avatar
              image={`${user?.avatar}`}
              name={user?.name as string}
              isOnline={user?.isOnline as boolean}
            />
            {isNameInEditMode ? (
              <form onSubmit={handleChangeUsername}>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    required
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setName(e.target.value);
                      if (
                        !(
                          users.filter((user) => user?.name === e.target.value)
                            .length === 0
                        )
                      ) {
                        showToast("error", "Username is already taken!");
                      }
                    }}
                  />
                </div>
              </form>
            ) : (
              <span className="">{user?.name}</span>
            )}
            {updateUsernameMutation.isLoading ? (
              <Spinner />
            ) : (
              <>
                {!isNameInEditMode ? (
                  <button
                    className="invisible group-hover:visible"
                    onClick={() => setIsNameInEditMode(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setName(user?.name);
                        setIsNameInEditMode(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={handleChangeUsername}>
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {menus.map((ele, index) => (
            <Link to={ele.link} className="w-full" key={index}>
              <Button
                className={cn("w-full flex gap-2 justify-start")}
                variant={"ghost"}
              >
                {ele.icon} {ele.text}
              </Button>
            </Link>
          ))}

          <div className="w-full flex justify-between hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 rounded-md">
            <div className="flex gap-2">
              <Moon />
              Dark Mode
            </div>
            <Switch
              aria-readonly
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            />
          </div>
        </div>
        <div className="flex flex-col space-y-8">
          <Separator />
          <SheetClose
            className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-10 px-4 py-2 flex gap-2 w-full"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isLoading}
          >
            <LogOutIcon className="w-5 h-5" /> Log Out
          </SheetClose>
        </div>
      </SheetHeader>
    </SheetContent>
  );
};

export default SideBar;
