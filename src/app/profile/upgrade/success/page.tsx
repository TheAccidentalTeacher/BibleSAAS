import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Subscription Active | Bible Study",
};

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-[#C4A040]" size={56} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-[#E8E0D4] mb-3">
          Your subscription is active
        </h1>
        <p className="text-[#8A7F72] text-sm leading-relaxed mb-8">
          Welcome to deeper study. Your new features are ready — Charles is looking
          forward to walking through Scripture with you.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#C4A040] text-[#0D0D0D] font-semibold text-sm px-8 py-3 rounded-full hover:bg-[#D4B050] transition-colors"
        >
          Continue reading
        </Link>
        <div className="mt-4">
          <Link href="/profile" className="text-[#6B6056] text-xs hover:text-[#C4A040] transition-colors">
            Back to profile
          </Link>
        </div>
      </div>
    </div>
  );
}
