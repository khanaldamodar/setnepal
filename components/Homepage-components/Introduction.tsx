import { getSettings } from "@/lib/settings";
import Heading from "../global/Heading";
import MobileSearch from "./MobileSearch";

const Introduction = async () => {
  const settings = await getSettings();
  return (
    <div className="flex flex-col items-center justify-center py-20 md:pt-20 md:pb-0 font-poppins px-15 md:50 lg:px-100 text-white gap-5 font-medium ">
      <div className="flex flex-col items-center gap-2">
        <Heading title="Set Nepal" />
        <span className="font-semibold text-sm">{settings.slogan || ""}</span>
      </div>
      <p className="text-center">{settings?.aboutShort}</p>
      <p className="bg-secondary p-2 rounded-xl ">
        For Inquery: {settings?.phone1}, {settings?.phone2}, {settings?.email1}
      </p>

      <MobileSearch />
    </div>
  );
};

export default Introduction;
