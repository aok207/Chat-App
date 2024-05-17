import { useAppSelector } from "@/hooks/hooks";

const HomePage = () => {
  const user = useAppSelector((state) => state.auth?.user);

  return (
    <div>
      <h1>Hello {user?.name}</h1>
    </div>
  );
};

export default HomePage;
