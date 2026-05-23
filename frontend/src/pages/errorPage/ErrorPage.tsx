import { Button } from "@/components/ui/button";
import { FC } from "react";
import { Link, useRouteError, useNavigate } from "react-router-dom";
import { RiErrorWarningFill } from "react-icons/ri";
import { IoMdHome } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";

const ErrorPage: FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col lg:flex-row items-center justify-center p-6">
      {/* Illustration Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
          <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
          <RiErrorWarningFill className="absolute inset-0 m-auto text-rose-500 w-full h-full" />
        </div>
        
        <div className="text-center space-y-2">
          {error?.status && (
            <h3 className="text-4xl font-bold text-rose-600">
              {error.status}
            </h3>
          )}
          {error?.statusText && (
            <h4 className="text-2xl font-semibold text-gray-700">
              {error.statusText}
            </h4>
          )}
          {error?.error?.message && (
            <p className="text-gray-500 max-w-md">
              {error.error.message.toLowerCase()}
            </p>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 lg:p-12 shadow-xl">
        <div className="max-w-md mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-lg lg:text-xl mb-8 opacity-90">
            Don't worry, it's not your fault. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all hover:shadow-md"
            >
              <IoArrowBack className="text-lg" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all hover:shadow-md">
                <IoMdHome className="text-lg" />
                Return Home
              </Button>
            </Link>
          </div>

          <div className="mt-12 pt-6 border-t border-indigo-400 border-opacity-30">
            <p className="text-indigo-200 text-sm">
              Need help? Contact our support team
            </p>
            <a 
              href="techelementit@gmail.com"
              className="text-white font-medium hover:underline"
            >
              {"techelementit@gmail.com"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ErrorPage;