import { Link } from "react-router-dom";

export default function SiteHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Headline at top half */}
      <div className="flex-1 flex flex-col items-center justify-end pb-12 px-6 text-center">
        <h1 className="text-6xl font-serif font-bold text-gray-800 mb-6">Simple Digits</h1>
        <p className="max-w-xl text-gray-600 text-lg">
          Easily track how your finances are going. <br />
          “Have we got enough money this month?” <br />
          “Are we going ok over the coming months?” <br />
          “Will there be enough cash to pay for that on the due date?”
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <Link to={"/login"}>Login</Link>
      </div>
    </div>
  );
}
