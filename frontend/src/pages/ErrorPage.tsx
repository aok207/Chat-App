import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ErrorPage = () => {
  const error = useRouteError();

  console.log(error);

  return (
    <>
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-800">
        <svg
          className="w-1/2 md:1/3 lg:w-1/4 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 600"
        >
          <path
            d="M400,0C179.085,0,0,179.085,0,400s179.085,400,400,400s400-179.085,400-400S620.915,0,400,0z M400,780
            C193.395,780,20,606.605,20,400S193.395,20,400,20s380,173.395,380,380S606.605,780,400,780z"
            fill="#e4e4e4"
          />
          <path
            d="M400,200c-110.457,0-200,89.543-200,200s89.543,200,200,200s200-89.543,200-200S510.457,200,400,200z M400,570
            c-93.72,0-170-76.28-170-170s76.28-170,170-170s170,76.28,170,170S493.72,570,400,570z"
            fill="#f2f2f2"
          />
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dy=".3em"
            fontSize="150"
            fill="currentColor"
          >
            {500}
          </text>
        </svg>
        <h1 className="text-2xl font-bold mt-8 text-red-600">
          Oops! Something went wrong.
        </h1>
        <p className="text-gray-600 dark:text-gray-100 mt-4 text-center max-w-md">
          An unexpected error has occurred. Please try refreshing the page, or
          click the button below to go back to the homepage.
        </p>
        <Link to="/" className="mt-6">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    </>
  );
};

export default ErrorPage;
