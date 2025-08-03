import { Link } from "react-router-dom";

export default function SiteHomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-end px-6 text-center pb-28">
        <h1 className="text-6xl font-serif font-bold text-gray-800 mb-6">Simple Digits</h1>
        <p className="max-w-xl text-gray-600 text-lg text-primary-foreground">
          Easily track how your finances are going. <br />
          “Have we got enough money this month?” <br />
          “Are we going ok over the coming months?” <br />
          “Will there be enough cash to pay for that on the due date?”
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full py-4 z-50 bg-white border-t border-border">
        <div className="max-w-screen-sm mx-auto px-4">
          <Link to="/login" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-md shadow hover:bg-primary/90 transition">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
